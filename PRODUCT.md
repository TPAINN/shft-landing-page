# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

People who train in the gym and want one dependable place to discover exercises, build repeatable plans, log sessions, and see their progress. The exact primary audience is inferred from the existing app.

## Product Purpose

Shft turns training intent into an approachable, repeatable practice. It brings the exercise library, plan builder, workout logging, progression cues, recovery information, and progress tracking into one mobile-first product.

## Positioning

Shft is built around consistency over perfect programming: a lifter can build a plan they will repeat, record a session without spreadsheets, and receive an actionable next-session cue when they reach their rep range.

## Operating Context

Users browse exercises, choose or build a split, run sessions at the gym, log sets and reps, track personal records and progress, and refer to technique, recovery, and supplement guidance.

## Capabilities and Constraints

- Exercise encyclopedia with technique tips, favourites, and custom exercises.
- Plan builder, split selection, training modes, and weekly set insights.
- In-session set logging, rest timing, personal-record detection, and progression suggestions.
- Progress, recovery, and guide surfaces.
- Shft is currently Android-only. The landing page is a separate React web project and must not imply iOS availability or display iOS download controls.
- Do not modify the Shft mobile-app repository.
- The primary landing-page action is **Explore Shft**, selected by the user; exact app-store and waitlist destinations are still undecided.

## Brand Commitments

- Product name: Shft.
- Existing line: "Shift your body. Shift your limits."
- The supplied app uses a true-black ground, sage green primary accent, and a focused, encouraging voice.
- The supplied brand artwork is the visual authority: a luminous mint Shft mark and wordmark over a black / steel performance world. Use it as brand presence; do not green-tint people or real gym media.
- The landing page should use supplied fitness videos and still imagery silently in the background, with a fluid and premium interaction language.
- The approved visual direction is an image-led, continuous “Night Shift Performance System”: a real athlete in a foreground crop may overlap hero typography to establish depth; no AI-generated photos will ship.
- The landing page opens with a brand-led cinematic preloader and moves through one uninterrupted scroll narrative rather than visibly segmented sections.

## Evidence on Hand

- App product truth and existing brand assets: `C:\Users\Administrator\Documents\GitHub\Shft` (read-only reference).
- Fitness imagery and silent video source library: `C:\Users\Administrator\Desktop\Shft landing page`.
- Chosen real hero photo: Pexels, "Man in Cap and Tank Top at Gym" (photo 18060150), downloaded into `public/media/hero-athlete.jpg`.
- User-approved planned launch pricing: Free $0, Premium $2.99/month. Purchases are not open; premium functionality is not yet a released entitlement. Label the pricing section accordingly.
- No verified customer testimonials, launch date, download URL, benchmark, or quantified outcomes have been provided; do not invent them.

## Product Principles

- Consistency over perfection.
- Explain the next useful action, not just the data.
- Keep training tools useful in the middle of a session.
- Make progress feel concrete and personal.

## Accessibility & Inclusion

- Respect `prefers-reduced-motion` and give video background a still-image fallback.
- Maintain readable contrast over all moving imagery and keyboard-accessible navigation.
