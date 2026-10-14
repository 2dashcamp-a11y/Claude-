# Brand assets

## Logo family (founder-provided artwork)

The original files you supplied are in `brand-source/` and are kept unchanged. The web-ready versions are in `public/brand/`:

| Variant | Files | Used for |
|---|---|---|
| Primary horizontal | `dod-logo-cream.svg`, `dod-logo-ink.svg` | Site header, legal-page header, social preview |
| Alternate horizontal, with (D) | `dod-logo-alt-cream.svg`, `dod-logo-alt-ink.svg` | Available; not currently placed |
| Stacked | `dod-logo-stacked-cream.svg`, `dod-logo-stacked-ink.svg` | Footer |
| D monogram | `dod-monogram-cream.svg`, `dod-monogram-ink.svg` | Favicon, Apple touch icon, hero diagram hub, founder monitor, footer, social preview |

### How the web files were made
- **The originals weren't usable as-is.** They are JPEGs with a transparency checkerboard baked into the pixels, not real transparency.
- **What I did:** separated the logo shapes from that background and traced them to SVG. **Nothing was redrawn or typeset in a font.** I checked each traced file against your original artwork; the shapes match more than 99%, and the small difference is anti-aliased edge pixels.
- **What was preserved:** every detail, including the dot-sized, opposite-facing parentheses above both i's in "Digital".
- **Recommended:** when you have the original vector files (AI, EPS, SVG or PDF), replace the files in `public/brand/` with exports of the same names. That gives mathematically exact outlines. Nothing in the code needs to change.

### Favicon set
`src/app/icon.svg`, `src/app/apple-icon.png` and `src/app/favicon.ico`: the cream (D) monogram on an ink rounded square.

## Palette

| Token | Hex | Use |
|---|---|---|
| Ink | `#0B0B0D` | Main dark background |
| Cream | `#F5EFE4` | Main light background and text on dark |
| Electric Violet | `#6F3FC5` | Digital accent: flagship card, primary buttons, Systems |
| Oxblood | `#76263C` | Warmth: accent bars, rules, required-field marks on cream, button hover |
| Stone | `#B6A79D` | Muted text on dark; the Experiences discipline color |

These supporting tints exist only so small text meets WCAG AA contrast. They are not new brand colors:

| Tint | Hex | Used for |
|---|---|---|
| Lilac | `#B9A0EE` | Violet text and marks on dark |
| Rosewood | `#C98494` | Oxblood text and marks on dark (Creative) |
| Graphite | `#55504A` | Muted text on cream (Stone itself is too light there) |
| Error red | `#B42318` | Form errors only; not brand |

The **chrome** gradient (white to warm silver) is used for hairlines, parentheses curves, monitor bezels and large numerals.

## Typography
- **Playfair Display:** editorial headlines and italic accents, with lining numerals.
- **Inter:** body text and user-interface text.
- **JetBrains Mono:** small labels and section markers.
- **Hosting and licensing:** all three are free (SIL Open Font License) and self-hosted, so pages make no requests to Google.
- **Not the logo font:** Playfair Display was chosen to sit well beside the logo's high-contrast serif. The logo always uses the artwork files and is never typeset.
