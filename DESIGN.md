# Shft landing page design system

This document records the site's own visual rules. Its structure follows the public [Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md) method; it does not copy another brand's identity or assets. The code in `src/tokens.css`, `src/styles.css`, and `src/App.jsx` is the implementation source of truth.

## 1. Visual theme and atmosphere

**Night Shift Performance:** focused, disciplined and physically grounded. One continuous dark canvas carries the story. Real training photography, short gym videos and actual app screenshots are the visual evidence. Avoid gamification, clinical dashboard styling, generic fitness stock motifs and decorative effects that compete with the product.

The reader's journey is outcome → friction → system → three-step product workflow → product proof → training culture → pricing → answers → close. Each section should change the *kind* of visual evidence, not the brand identity. In particular, do not stack multiple text-only bands.

## 2. Color palette and roles

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Ground | `--color-ink` | `#070907` | Page canvas and dark media fades |
| Surfaces | `--color-surface-1/2/3` | `#0d1310` / `#161f1a` / `#212c25` | Depth without a light-theme break |
| Main text | `--color-text` | `#ecf1ee` | Headlines and high-priority copy |
| Muted text | `--color-muted` | `#8b9a92` | Descriptions and supporting information |
| Accent | `--color-sage` | `#a6e4af` | Primary action, emphasis and focus |
| Accent states | `--color-sage-light/deep` | `#e8f7eb` / `#69c990` | Hover and restrained secondary details |

Sage is one accent system, not a license for new green section themes. Use white only for readable text. Never introduce an inverted white block into the story.

## 3. Typography rules

Saira Condensed, weight 800, is the uppercase display voice; Manrope is the body and UI voice. Preserve the wordmark as an asset, not retyped text. Display scales live in `--text-display`, `--text-section` and `--text-title`; headings have compact line height, while body copy stays comfortably readable. Short lines and direct verbs suit the training context. The primary line is “Shift your body. Shift your limits.”

Headlines make one claim. Supporting copy explains the benefit in plain language. Avoid inflated results, invented testimonials or unverified performance statistics.

## 4. Component styling

- Primary action: solid sage, ink text, 14px control radius, visible focus ring and small transform feedback.
- Secondary action: text link with a restrained sage underline; it must not compete with the primary action.
- Content panels: 20px radius only when containment helps comprehension. Editorial rows and section transitions usually need spacing or a fine rule instead of more cards.
- Product imagery: the same iPhone mockup throughout. Screenshots must be genuine and directly related to adjacent copy.
- Pricing: exactly Free and Premium. State clearly that Premium is coming later; do not style unavailable purchasing as a live checkout.
- FAQ: native `details` and `summary`, generous tap targets, keyboard-visible focus and legible open states.

## 5. Layout and page rhythm

The main content measure is 1180px with at least 24px side spacing on desktop. Sections use generous vertical rhythm but should not expose empty, screen-high gaps. Alternate visual families: cinematic media, editorial rows, product grid, pinned phone sequence, video-and-device proof, social clips, pricing, FAQ and closing image. Keep existing anchor IDs and route paths stable.

The hero is the sole first-viewport statement. The following `#why` band combines a short message with a low-cost training photograph; the problem section below it carries the detailed friction. The app workflow uses 01/02/03 screen changes tied to scroll progress, not a separate page reload.

## 6. Depth, elevation and motion

Depth comes first from real imagery and restrained dark fades, then from subtle parallax. Avoid obvious glow stacks or heavy shadows. Motion must orient or reveal: section copy enters and exits smoothly, the phone changes screen in place, buttons respond immediately, and background media never fights foreground text. Animate opacity and transforms; avoid layout animation on scroll.

Lenis is the sole smooth-scroll layer. Honor `prefers-reduced-motion`: no forced smooth scrolling, spatial reveal or preloader movement. Video should be muted, inline and progressively loaded. Decorative visuals cannot block links or harm contrast.

## 7. Do and do not

**Do:** use supplied Shft branding, genuine app screens, real exercise/training media, concise claims, consistent sage emphasis and a clear next action.

**Do not:** copy another fitness brand's logo, typography treatment or proprietary copy; invent social proof; add gratuitous gradients or marquee effects; introduce multiple accent hues; interrupt the dark narrative with a white theme; or add animation solely to appear complex.

## 8. Responsive behavior

At narrow widths, split grids become single-column; the message remains first, the media becomes atmospheric and the phone mockup scales without cropping. Keep content legible from 320px upward with no horizontal overflow. Images keep their aspect ratio; videos use an intentional crop. All links, controls and FAQ summaries remain usable by touch and keyboard. The header, safe-area spacing and section heights must work on mobile browsers with dynamic chrome.

## 9. Design-agent implementation guide

Before changing a section, inspect its neighboring sections and ask what role it plays in the narrative. Reuse the tokens and existing component patterns. Prefer an existing, properly sized media asset over a new dependency or a decorative placeholder. Check desktop and mobile screenshots after every visible change, verify reduced-motion behavior, and run the build plus the site's visual/interaction checks before claiming completion.
