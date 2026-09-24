"""Trace three-panel generated exercise artwork into original white contour SVGs.

Dependencies: bundled Pillow/numpy, and vtracer installed in an isolated tool directory.
The input manifest has exercises: [{name, slug, source: relative PNG filename}].
No anatomical accuracy is inferred from automated geometry checks.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import sys
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

import numpy as np
from PIL import Image

SVG_NS = "http://www.w3.org/2000/svg"
QA_STATUS = "illustration draft; human movement review required"
ET.register_namespace("", SVG_NS)


def black_ink(image: Image.Image, threshold: int = 110) -> Image.Image:
    rgba = np.asarray(image.convert("RGBA"))
    ink = (rgba[:, :, 3] > 128) & (rgba[:, :, :3].max(axis=2) < threshold)
    return Image.fromarray(ink.astype(np.uint8) * 255)


def runs(values: np.ndarray) -> list[tuple[int, int]]:
    edges = np.diff(np.pad(values.astype(np.int8), (1, 1)))
    return list(zip(np.flatnonzero(edges == 1), np.flatnonzero(edges == -1)))


def prepare_frames(source: Path, threshold: int) -> tuple[list[Image.Image], dict]:
    with Image.open(source) as image:
        width, height = image.size
        if abs(width / 3 - height) > height * 0.2:
            raise ValueError(f"{source.name}: expected three roughly square panels, got {width}x{height}")
        panel_width = width // 3
        sheet = black_ink(image, threshold)
    removed_separators = []
    # Some generated sheets place intact poses across nominal thirds. Infer cuts from blank gaps.
    # Full-height thin dividers are removed only when isolated from artwork by empty guard bands.
    stripe = max(2, round(panel_width / 60))
    guard = max(3, round(panel_width / 45))
    pixels = np.asarray(sheet)
    divider_columns = (np.count_nonzero(pixels, axis=0) > height * .8) & (pixels[0] > 0) & (pixels[-1] > 0)
    for left, right in runs(divider_columns):
        # Include antialiased fringe columns of the same isolated divider.
        left, right = int(left), int(right)
        for _ in range(stripe):
            if left > 0 and sheet.crop((left - 1, 0, left, height)).getbbox():
                left -= 1
            else:
                break
        for _ in range(stripe):
            if right < width and sheet.crop((right, 0, right + 1, height)).getbbox():
                right += 1
            else:
                break
        center = (left + right) / 2
        if (right - left <= stripe and min(abs(center - panel_width), abs(center - 2 * panel_width)) < panel_width * .2
                and not sheet.crop((max(0, left - guard), 0, left, height)).getbbox()
                and not sheet.crop((right, 0, min(width, right + guard), height)).getbbox()):
            sheet.paste(0, (int(left), 0, int(right), height))
            removed_separators.append([int(left), int(right)])
    gaps = runs(np.count_nonzero(np.asarray(sheet), axis=0) == 0)
    cuts = [0]
    for expected in (panel_width, 2 * panel_width):
        candidates = [(left + right) // 2 for left, right in gaps
                      if right - left >= 5
                      and abs((left + right) / 2 - expected) < panel_width * .35]
        if not candidates:
            raise ValueError(f"{source.name}: no safe blank separator near panel {len(cuts)}; regenerate merged groups")
        cuts.append(int(min(candidates, key=lambda cut: abs(cut - expected))))
    cuts.append(width)
    if cuts != sorted(set(cuts)):
        raise ValueError(f"{source.name}: ambiguous panel cuts")
    masks = [sheet.crop((cuts[i], 0, cuts[i + 1], height)) for i in range(3)]
    boxes = [mask.getbbox() for mask in masks]
    for index, (mask, box) in enumerate(zip(masks, boxes), 1):
        ink_count = int(np.count_nonzero(np.asarray(mask)))
        if not box or ink_count < 20:
            raise ValueError(f"{source.name} frame {index}: no usable black contour")
        if ink_count / (mask.width * height) > 0.35:
            raise ValueError(f"{source.name} frame {index}: excessive opaque dark area; inspect source background")
        if box[0] < 2 or box[1] < 2 or box[2] > mask.width - 2 or box[3] > height - 2:
            raise ValueError(f"{source.name} frame {index}: source contour touches panel boundary; likely clipped")
    top, bottom = min(b[1] for b in boxes), max(b[3] for b in boxes)
    crop_height = bottom - top
    scale = 448 / max(max(box[2] - box[0] for box in boxes), crop_height)
    canvases, offsets = [], []
    for mask, box in zip(masks, boxes):
        # Shared scale and vertical origin; each intact pose is centered horizontally.
        size = (max(1, round((box[2] - box[0]) * scale)), max(1, round(crop_height * scale)))
        offset = ((512 - size[0]) // 2, (512 - size[1]) // 2)
        resized = mask.crop((box[0], top, box[2], bottom)).resize(size, Image.Resampling.LANCZOS)
        resized = resized.point(lambda value: 255 if value >= 96 else 0)
        canvas = Image.new("L", (512, 512), 0)
        canvas.paste(resized, offset)
        canvases.append(canvas)
        offsets.append(offset)
    return canvases, {"sourceDimensions": [width, height], "panelCuts": cuts,
                      "sharedVerticalBounds": [top, bottom], "panelInkBounds": boxes,
                      "removedPanelSeparatorStripes": removed_separators,
                      "scale": scale, "offsets": offsets}


def vector_control_bounds(paths: list[ET.Element]) -> tuple[float, float, float, float]:
    """A cubic Bezier stays inside its control-point hull, making this a conservative bounds check."""
    xs, ys = [], []
    number = r"[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?"
    for path in paths:
        d = path.get("d", "")
        without_numbers = re.sub(number, "", d)
        if set(re.findall(r"[A-Za-z]", without_numbers)) - set("MCLQZ"):
            raise ValueError("Unsupported tracer path command; expected absolute M/C/L/Q/Z paths")
        coords = [float(value) for value in re.findall(number, d)]
        if not coords or len(coords) % 2:
            raise ValueError("Malformed vector path coordinates")
        transform = path.get("transform", "translate(0,0)")
        translation = re.fullmatch(rf"translate\(\s*({number})[ ,]+({number})\s*\)", transform)
        if not translation:
            raise ValueError("Unexpected tracer transform")
        tx, ty = map(float, translation.groups())
        xs.extend(value + tx for value in coords[::2])
        ys.extend(value + ty for value in coords[1::2])
    return min(xs), min(ys), max(xs), max(ys)


def trace_frame(mask: Image.Image, name: str, index: int, work: Path, vtracer) -> tuple[str, dict]:
    bitmap, traced = work / "ink.png", work / "trace.svg"
    drawing = Image.new("RGB", (512, 512), "white")
    drawing.paste("black", mask=mask)
    drawing.save(bitmap)
    vtracer.convert_image_to_svg_py(
        str(bitmap), str(traced), colormode="binary", mode="spline",
        filter_speckle=8, corner_threshold=60, length_threshold=3.0,
        max_iterations=10, splice_threshold=45, path_precision=3,
    )
    traced_root = ET.parse(traced).getroot()
    root = ET.Element(f"{{{SVG_NS}}}svg", {"width": "512", "height": "512", "viewBox": "0 0 512 512",
                                       "role": "img", "aria-labelledby": "title description"})
    ET.SubElement(root, f"{{{SVG_NS}}}title", {"id": "title"}).text = f"{name} — frame {index}"
    ET.SubElement(root, f"{{{SVG_NS}}}desc", {"id": "description"}).text = QA_STATUS
    paths = []
    for original in traced_root.iter(f"{{{SVG_NS}}}path"):
        if original.get("fill", "").lower() not in ("#000000", "#000", "black"):
            continue
        attrs = {key: value for key, value in original.attrib.items()
                 if key in ("d", "transform", "fill-rule", "clip-rule")}
        attrs["fill"] = "#ffffff"
        paths.append(ET.SubElement(root, f"{{{SVG_NS}}}path", attrs))
    if not paths:
        raise ValueError(f"{name} frame {index}: tracer returned no black paths")
    vector_bounds = vector_control_bounds(paths)
    if (vector_bounds[0] < 16 or vector_bounds[1] < 16
            or vector_bounds[2] > 496 or vector_bounds[3] > 496):
        raise ValueError(f"{name} frame {index}: vector geometry exceeds safe canvas margin")
    svg = ET.tostring(root, encoding="unicode") + "\n"
    checked = ET.fromstring(svg)
    if any(node.tag.rsplit("}", 1)[-1] in ("image", "foreignObject", "script", "rect")
           for node in checked.iter()):
        raise ValueError("Unexpected raster, script, or opaque background in generated SVG")
    box = mask.getbbox()
    if not box or box[0] < 16 or box[1] < 16 or box[2] > 496 or box[3] > 496:
        raise ValueError(f"{name} frame {index}: output ink overflows safe canvas margin")
    return svg, {"frame": index, "pathCount": len(paths), "inkBounds": box,
                        "vectorControlBounds": vector_bounds,
                        "inkPixels": int(np.count_nonzero(np.asarray(mask))),
                        "sha256": hashlib.sha256(svg.encode()).hexdigest(),
                        "width": 512, "height": 512, "viewBox": [0, 0, 512, 512],
                        "rasterEmbedded": False, "qaStatus": QA_STATUS}


def read_entries(manifest: Path, source_dir: Path, only: str | None) -> list[dict]:
    document = json.loads(manifest.read_text(encoding="utf-8"))
    if isinstance(document, dict) and "promptManifest" in document:
        entries = json.loads((manifest.parent / document["promptManifest"]).read_text(encoding="utf-8"))
        for entry in entries:
            entry["source"] = document["sourcePattern"].format(slug=entry["slug"])
            entry["assumption"] = document.get("assumptions", {}).get(entry["slug"])
    else:
        entries = document if isinstance(document, list) else document["exercises"]
    if only:
        entries = [entry for entry in entries if entry["slug"] in only.split(",")]
        if not entries or len(entries) != len(set(only.split(","))):
            raise ValueError("--only contains unknown or repeated exercise slugs")
    slugs = [entry["slug"] for entry in entries]
    if len(slugs) != len(set(slugs)):
        raise ValueError("Manifest contains duplicate slugs")
    for entry in entries:
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", entry["slug"]):
            raise ValueError(f"Invalid output slug: {entry['slug']}")
        if not isinstance(entry.get("name"), str) or not entry["name"].strip():
            raise ValueError("Every entry needs a nonempty name")
        filename = entry.get("source")
        if not filename:
            raise ValueError(f"{entry['slug']}: missing source mapping; no files written")
        source = (source_dir / filename).resolve()
        if not source.is_relative_to(source_dir):
            raise ValueError(f"{entry['slug']}: source escapes --source-dir")
        if not source.is_file():
            raise ValueError(f"{entry['slug']}: missing source image {source}")
        entry["sourcePath"] = source
    return entries


def self_check() -> None:
    image = Image.new("RGBA", (3, 1))
    image.putdata([(0, 0, 0, 0), (255, 255, 255, 255), (0, 0, 0, 255)])
    assert list(black_ink(image).get_flattened_data()) == [0, 0, 255]
    curve = ET.Element("path", {"d": "M0 0 C10 20 30 20 40 0 Z", "transform": "translate(20,30)"})
    assert vector_control_bounds([curve]) == (20, 30, 60, 50)
    with tempfile.TemporaryDirectory() as folder:
        source = Path(folder) / "panels.png"
        panels = Image.new("RGBA", (192, 64), (0, 0, 0, 0))
        for x in (32, 96, 160):
            for y in range(8, 56):
                panels.putpixel((x, y), (0, 0, 0, 255))
        for y in range(64):
            panels.putpixel((63, y), (0, 0, 0, 255))
            panels.putpixel((64, y), (0, 0, 0, 255))
        panels.save(source)
        frames, details = prepare_frames(source, 110)
        assert len(frames) == 3 and all(frame.size == (512, 512) for frame in frames)
        boxes = [frame.getbbox() for frame in frames]
        assert boxes[0][1] == boxes[1][1] == boxes[2][1]
        assert len(details["removedPanelSeparatorStripes"]) == 1
        uneven_source = Path(folder) / "uneven-width.png"
        panels.crop((0, 0, 191, 64)).save(uneven_source)
        uneven_frames, _ = prepare_frames(uneven_source, 110)
        assert len(uneven_frames) == 3
        for x in range(30):
            panels.putpixel((x, 30), (0, 0, 0, 255))
        panels.save(source)
        try:
            prepare_frames(source, 110)
        except ValueError as error:
            assert "boundary" in str(error)
        else:
            raise AssertionError("Actual clipped artwork must be rejected")
    print("SELF_CHECK_OK: ink extraction, shared scale, isolated dividers removed, clipped art rejected")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=Path(__file__).with_name("exercise-assets.json"))
    parser.add_argument("--source-dir", type=Path)
    parser.add_argument("--dest", type=Path)
    parser.add_argument("--tool-deps", type=Path, help="isolated directory containing vtracer")
    parser.add_argument("--only", help="comma-separated subset for sample verification")
    parser.add_argument("--ink-threshold", type=int, default=110)
    parser.add_argument("--overwrite", action="store_true", help="explicitly replace generated files in staging")
    parser.add_argument("--self-check", action="store_true")
    args = parser.parse_args()
    if args.self_check:
        self_check()
        return
    if not args.source_dir or not args.dest:
        parser.error("--source-dir and --dest are required")
    if not 1 <= args.ink_threshold <= 200:
        parser.error("--ink-threshold must be between 1 and 200")
    if args.tool_deps:
        sys.path.insert(0, str(args.tool_deps.resolve()))
    try:
        import vtracer
    except ImportError:
        parser.error("vtracer is unavailable: install it in an isolated directory and pass --tool-deps")
    source_dir, dest = args.source_dir.resolve(), args.dest.resolve()
    if dest == source_dir or dest.is_relative_to(source_dir) or source_dir.is_relative_to(dest):
        parser.error("--dest must be separate from the generated source collection")
    entries = read_entries(args.manifest, source_dir, args.only)
    output_paths = [dest / entry["slug"] / f"frame-{index}.svg" for entry in entries for index in range(1, 4)]
    output_paths += [dest / name for name in ("manifest.json", "qa-report.json", "preview.html")]
    if not args.overwrite and any(path.exists() for path in output_paths):
        parser.error("output exists; use a fresh staging folder or explicit --overwrite")
    # Trace everything before publishing any SVG so a bad source cannot create a partial release.
    rendered, report = [], []
    with tempfile.TemporaryDirectory(prefix="shft-vector-trace-") as temporary:
        work = Path(temporary)
        for entry in entries:
            frames, source_info = prepare_frames(entry["sourcePath"], args.ink_threshold)
            details = []
            for index, mask in enumerate(frames, 1):
                svg, qa = trace_frame(mask, entry["name"], index, work, vtracer)
                relative = f"{entry['slug']}/frame-{index}.svg"
                rendered.append((relative, svg))
                details.append({"file": relative, **qa})
            report.append({"name": entry["name"], "slug": entry["slug"], "source": entry["source"],
                           "movementSpec": entry.get("poses"), "assumption": entry.get("assumption"),
                           **source_info, "frames": details, "qaStatus": QA_STATUS})
    for relative, svg in rendered:
        path = dest / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(svg.encode("utf-8"))
    collection = {"exerciseCount": len(entries), "svgCount": len(rendered), "framesPerExercise": 3,
                  "inkRule": f"alpha > 128 and each RGB channel < {args.ink_threshold}",
                  "qaStatus": QA_STATUS, "anatomicalAccuracyCertified": False, "exercises": report}
    dest.mkdir(parents=True, exist_ok=True)
    for name in ("manifest.json", "qa-report.json"):
        (dest / name).write_text(json.dumps(collection, indent=2, ensure_ascii=False), encoding="utf-8")
    cards = []
    for entry in report:
        images = "".join(f'<img src="{html.escape(frame["file"], quote=True)}" alt="Frame {frame["frame"]}">'
                         for frame in entry["frames"])
        cards.append(f'<article><h2>{html.escape(entry["name"])}</h2><div>{images}</div><small>{QA_STATUS}</small></article>')
    preview = ('<!doctype html><html lang="en"><meta charset="utf-8"><title>Shft exercise asset review</title>'
               '<style>body{background:#101914;color:white;font:14px system-ui;margin:24px}'
               'article{border-bottom:1px solid #344438;padding:12px 0}h2{font-size:18px}'
               'article div{display:flex;gap:12px}img{width:256px;height:256px}small{color:#a8b9ac}</style>'
               f'<h1>{len(entries)} exercise drafts · {len(rendered)} SVG frames</h1>'
               '<p>White vector contours on transparency. Human movement review required.</p>'
               + "".join(cards) + '</html>')
    (dest / "preview.html").write_text(preview, encoding="utf-8")
    print(json.dumps({"destination": str(dest), "exerciseCount": len(entries), "svgCount": len(rendered),
                      "qaStatus": QA_STATUS, "preview": str(dest / "preview.html")}))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError, ET.ParseError) as error:
        print(f"ASSET_BUILD_FAILED: {error}", file=sys.stderr)
        sys.exit(1)
