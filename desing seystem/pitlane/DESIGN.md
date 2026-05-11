---
name: Pitlane
colors:
  surface: '#200e0d'
  surface-dim: '#200e0d'
  surface-bright: '#4b3331'
  surface-container-lowest: '#1a0908'
  surface-container-low: '#2a1614'
  surface-container: '#2e1a18'
  surface-container-high: '#3a2522'
  surface-container-highest: '#462f2d'
  on-surface: '#ffdad6'
  on-surface-variant: '#e9bcb7'
  inverse-surface: '#ffdad6'
  inverse-on-surface: '#412b28'
  outline: '#af8783'
  outline-variant: '#5e3f3b'
  surface-tint: '#ffb4ab'
  primary: '#ffb4ab'
  on-primary: '#690006'
  primary-container: '#e5001a'
  on-primary-container: '#fff6f5'
  inverse-primary: '#c00014'
  secondary: '#c7c7c2'
  on-secondary: '#30312e'
  secondary-container: '#484946'
  on-secondary-container: '#b9b8b4'
  tertiary: '#a2c9ff'
  on-tertiary: '#00315b'
  tertiary-container: '#0074c9'
  on-tertiary-container: '#f6f8ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000c'
  secondary-fixed: '#e3e2de'
  secondary-fixed-dim: '#c7c7c2'
  on-secondary-fixed: '#1b1c19'
  on-secondary-fixed-variant: '#464744'
  tertiary-fixed: '#d3e4ff'
  tertiary-fixed-dim: '#a2c9ff'
  on-tertiary-fixed: '#001c38'
  on-tertiary-fixed-variant: '#004880'
  background: '#200e0d'
  on-background: '#ffdad6'
  surface-variant: '#462f2d'
typography:
  display-lg:
    fontFamily: Barlow Condensed
    fontSize: 72px
    fontWeight: '900'
    lineHeight: '1.0'
    letterSpacing: -0.02em
  display-md:
    fontFamily: Barlow Condensed
    fontSize: 48px
    fontWeight: '900'
    lineHeight: '1.0'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Barlow Condensed
    fontSize: 32px
    fontWeight: '900'
    lineHeight: '1.1'
  headline-sm:
    fontFamily: Barlow Condensed
    fontSize: 24px
    fontWeight: '900'
    lineHeight: '1.1'
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.2'
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: '1.0'
spacing:
  unit: 4px
  margin-mobile: 16px
  margin-desktop: 48px
  gutter: 1px
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system is engineered for the high-velocity, data-driven world of Formula 1 in 2026. It adopts a **Dark Editorial** aesthetic that blends the raw, industrial energy of the garage with the sophisticated layout of a premium sports journal. 

The personality is aggressive, precise, and uncompromising. By stripping away modern UI trends like soft corners and gradients, the system leans into a **Technological Brutalism**. The interface should feel like a digital race program: high-contrast, information-dense, and visually striking. It targets the "super-fan" who values technical telemetry and editorial depth over decorative flair.

## Colors
The palette is restricted to four high-impact tones to maintain a focused, editorial atmosphere.

- **Flat Black (#0A0A0A):** The foundation. It provides a deep, non-reflective base that mimics carbon fiber and asphalt.
- **Signal Red (#E5001A):** Used exclusively for primary actions, critical alerts, and branding accents. It is the "heat" in the interface.
- **Off-white (#F0EDE8):** Used for primary body copy and headings. The slight warmth prevents the eye strain associated with pure white on black.
- **Brushed Silver (#9A9A96):** Reserved for metadata, labels, and secondary UI borders. It provides a mechanical, metallic contrast to the primary text.

## Typography
The typographic strategy relies on the tension between the loud, condensed display type and the technical, monospaced functional type.

- **Barlow Condensed (900):** Used for all major headlines and impact numbers (e.g., Lap Times, Positions). It must always be uppercase to evoke the feel of race posters and trackside signage.
- **JetBrains Mono:** Used for all reading text, UI labels, and telemetry data. The fixed-width nature of this font ensures that live-updating data (like intervals or fuel loads) remains stable on screen without horizontal shifting.

Vertical rhythm is tight; headings should sit close to the content they introduce.

## Layout & Spacing
The layout follows a strict, mathematical grid inspired by technical blueprints and modular print design.

- **The Grid:** A 12-column system is used across all breakpoints. On mobile, elements typically span the full width or 6 columns.
- **The "Rule of One":** Use 1px Brushed Silver dividers to separate content blocks. These lines represent the precision of F1 engineering.
- **Negative Space:** While the aesthetic is "minimal," it is not "airy." Information density is high, but structured. Padding should be consistent (multiples of 4px) to maintain a mechanical feel.
- **Alignment:** All elements must be strictly flush-left or flush-right. Avoid center alignment to maintain the "poster-like" editorial structure.

## Elevation & Depth
This design system rejects the concept of Z-axis depth. There are no shadows or blurs. 

Hierarchy is established through:
1. **Scale:** Massive Barlow Condensed type versus small JetBrains Mono labels.
2. **Color Inversion:** Active states or critical alerts use a Signal Red background with Off-white text.
3. **Borders:** Containers are defined by 1px Brushed Silver outlines. 
4. **Zebra Striping:** For long data lists (e.g., Driver Standings), use a slightly lighter black (#141414) to differentiate rows without adding "lift."

## Shapes
The shape language is binary: everything is a rectangle or a line. 

- **Radius:** 0px across all components (Buttons, Cards, Inputs).
- **Angular Accents:** When a "dynamic" element is needed, use 45-degree chamfered corners on one side of a container to mimic the aerodynamic vanes of an F1 car. 
- **Dividers:** Horizontal and vertical lines must be 1px thick, sharp, and extend to the edge of their parent containers where possible.

## Components
- **Buttons:** Solid Signal Red blocks with Off-white text in JetBrains Mono (Bold/Caps). No hover state shadows; instead, invert colors on interaction (Off-white background/Signal Red text).
- **Cards:** Defined by a 1px Brushed Silver border. Background remains #0A0A0A. Headers within cards should be separated by a 1px horizontal line.
- **Data Tables:** High-density rows. Header row in Signal Red or Brushed Silver caps. Data points should use JetBrains Mono for alignment.
- **Status Indicators:** Small, sharp squares (4x4px or 8x8px) in Signal Red to indicate "Live" or "Active" states.
- **Inputs:** Simple 1px Brushed Silver bottom-border only. Labels sit above the input in JetBrains Mono (Small/Caps/Silver).
- **Telemetry Chips:** Rectangular tags with 1px borders. Use Signal Red for "Hard" tires, Brushed Silver for "Medium," etc., ensuring the text remains legible JetBrains Mono.