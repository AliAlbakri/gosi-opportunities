---
name: gosi-brand
description: Apply GOSI (General Organization for Social Insurance, Saudi Arabia) brand identity, from the official Core Elements Guidelines (Dec 2024), to any output - slides, docs, PDFs, UI screens, web pages, social posts, illustrations or image prompts. Use whenever the user mentions GOSI, التأمينات الاجتماعية, Social Insurance, or asks for something "in GOSI style / brand / identity".
---

# GOSI Brand Identity

Source: *GOSI Core Elements Guidelines, December 2024* (Copyright GOSI 2024).
Everything below is taken from that document unless marked **[derived]** (computed from the official values) or **[fallback]** (a substitute when the official asset is unavailable).

Exact tokens are in `references/tokens.css` and `references/tokens.json`.
Official brand artwork is in `assets/` (see section 9). **Always use these files; never redraw the logo, arrow or icons.**

---

## 1. Brand strategy (use for tone, copy and imagery)

- **Brand essence:** *Securing Futures* - a constant source of stability, guidance and prosperity for people at every life stage.
- **Brand promise:** *A partnership for a lifetime of security.*
- **Personality:**
  - **Steadfast guardian** - safeguards interests; offers stability in uncertain moments.
  - **Wise mentor** - insight from years of experience; guidance that evolves.
  - **Adaptable** - meets the diverse needs of each generation.
- **Values:** Embracing responsibility · Executing as one · Connecting with care · Unlocking possibilities.
- **Attributes:** Trustworthy, Future-focused, Inclusive, Respectful, Transparent, Adaptive, Collaborative, Knowledgeable.

**Voice in practice:** warm, friendly, clear and reassuring. Confident but never cold or bureaucratic. Short, plain sentences. Speaks to people across all ages and backgrounds. Favor forward-moving language (journey, future, growth, progress) that echoes the arrow.

---

## 2. Logo

The lockup = lowercase wordmark **"gosi"** + green **arrow (›)** + Arabic **التأمينات الاجتماعية** + English **Social Insurance**, stacked.
Meaning: the arrow represents movement, progression, and the continuous journey of empowerment for generations.

**Always use the master artwork in `assets/logo/`.** Never redraw, retype or rebuild the logo in code, SVG or text. Pick the file that matches the background (see the table below and section 9). In HTML, inline the SVG or embed it as a data URI so it renders without external hosting.

Three lockups exist:
- **Primary** (`gosi-logo-primary-*`): gosi› + التأمينات الاجتماعية + Social Insurance. Default for almost everything.
- **Descriptor** (`gosi-logo-descriptor-*`): gosi› + المؤسسة العامة للتأمينات الاجتماعية + General Organization for Social Insurance. For formal/official documents where the full name is needed.
- **Wordmark** (`gosi-wordmark-*`): gosi› only. For tight spaces such as app headers, favicons-sized marks, social avatars, where the descriptor would be illegible.

### Color versions
| Version | Background | Wordmark & text | Arrow |
|---|---|---|---|
| Full color (primary) | White / light | Rich Blue `#00004E` | Vivid Green `#00BF00` |
| Full color reversed | Rich Blue `#00004E` | White | Vivid Green `#00BF00` |
| Mono black | White | Black | Black |
| Mono white | Black | White | White |
| Mono white on green | Vivid Green `#00BF00` | White | White |

Use monochrome for B/W reproduction, or whenever the green arrow would be lost against the background. Always keep sufficient contrast.

### Placement
- Any of the four corners. **Preferred: left side (top-left or bottom-left).**
- Right side (top or bottom) is allowed when content requires it. Final position is at the designer's discretion, fit for purpose.

### Co-branding
With another brand's logo: place it in one of the two corners opposite the master logo position, side by side, separated by a **thin grey vertical line**. GOSI logo comes first.

### Exclusion zone
Clear space on all sides = **X**, where X = the x-height of the word "gosi" (top of the "o" to the baseline). No type, logos or graphics inside it.

### Minimum size
- Print: **20 mm** wide.
- Screen: no fixed minimum; always preserve legibility.

### Don't
- Don't squash or stretch the logo.
- Don't re-color the logo (e.g. all green).
- Don't re-color the arrow (e.g. blue arrow).
- Don't apply drop shadows or effects.
- Don't remove the arrow.
- Don't alter, rotate or reposition logo elements.

---

## 3. Color

### Primary
| Name | HEX | RGB | CMYK | Pantone |
|---|---|---|---|---|
| **Rich Blue** | `#00004E` | 0 0 78 | C100 M90 Y15 K40 | 655C |
| **Vivid Green** | `#00BF00` | 0 191 0 | C75 M0 Y100 K0 | 361C |
| **Pure White** | `#FFFFFF` | 255 255 255 | C0 M0 Y0 K0 | - |
| **Midnight** | `#00122D` | 0 18 45 | C100 M80 Y50 K70 | 7546C |

Rich Blue, Vivid Green and Midnight each have official tints at **80% / 50% / 25% / 10%** (tint = color mixed with white). Hex values **[derived]**:

| Tint | Rich Blue | Vivid Green | Midnight |
|---|---|---|---|
| 80% | `#333371` | `#33CC33` | `#334157` |
| 50% | `#8080A7` | `#80DF80` | `#808996` |
| 25% | `#BFBFD3` | `#BFEFBF` | `#BFC4CB` |
| 10% | `#E6E6ED` | `#E6F9E6` | `#E6E7EA` |

### Secondary
| Name | HEX | RGB | CMYK | Pantone |
|---|---|---|---|---|
| **Blue** | `#0064FF` | 0 100 255 | C95 M50 Y0 K0 | 2175C |
| **Purple** | `#A37DFC` | 163 125 252 | C52 M57 Y0 K0 | 3543C |

### How the guideline uses color
- **Rich Blue** is the anchor: logo wordmark, body text on light backgrounds, dark hero/section backgrounds.
- **Vivid Green** is the energy: the arrow, primary CTAs, highlights, full-bleed section backgrounds.
- **White** carries most content pages; light grey pages use Midnight 10% (`#E6E7EA`).
- **Blue and Purple** are for section dividers, pattern backgrounds and variety. They support, they don't lead.
- Large flat color fields with white type are a signature look (cover, dividers, quote slides).

### Accessibility notes **[derived - WCAG contrast]**
- White on Rich Blue / Midnight: excellent, any size.
- White on Blue `#0064FF`: ~4.9:1, passes AA for body text.
- White on Vivid Green `#00BF00`: ~2.5:1, **large display text only** (as in the guideline headlines). For small text or button labels on green, use **Rich Blue** (~7.6:1).
- White on Purple `#A37DFC`: ~3:1, large text only. For small text on purple use Midnight or Rich Blue.
- Never put green text on blue or blue text on green at small sizes.

---

## 4. Typography

**Official typeface: Ping** by Typotheque (Latin + Arabic, also Hindi, Urdu, Filipino) for one cohesive style across languages.
Download / license: https://www.typotheque.com/fonts/ping
Character: rounded, friendly geometric sans. The guideline's aim is "a warm and friendly tone".

**[fallback]** when Ping is not installed or licensed for the environment:
- Latin: `Inter`
- Arabic: `IBM Plex Sans Arabic`
State the substitution once if the output is meant to be final.

```css
font-family: "Ping LT", "Ping AR", "Inter", "IBM Plex Sans Arabic", system-ui, sans-serif;
```

### Hierarchy (as used throughout the guideline)
- **Display headline:** very large, regular/medium weight, tight leading, sentence case. ("Securing futures")
- **Section label:** number + name, light weight, e.g. `1.0   Our brand strategy`.
- **Subheading:** medium/bold, sentence case.
- **Body:** regular, generous line-height (~1.4-1.5), short line lengths.
- **Running header:** small bold section number at top-left, section title next to it, page number top-right.
- **Footer:** small "Copyright GOSI 2024" bottom-left.

Use **sentence case** everywhere; no all-caps headlines. Arabic and English should be set in the same family for visual parity; set Arabic layouts RTL.

---

## 5. Visual properties (the arrow pattern)

The GOSI arrow (the chevron from the logo, one straight edge and one curved edge) is the core graphic device. It signifies the continuous journey of empowerment for generations of Saudi people.

Pattern styles shown in the guideline:
1. Dense grid of alternating `> <` arrows in Vivid Green.
2. Two-tone green (full + tint) checkerboard of arrows.
3. Small arrow grid with larger feature arrows breaking through.
4. Multi-color grid (green, blue, purple).
5. Two-color grid (green + blue).
6. Large, oversized arrow shapes cropped off the edge, tone-on-tone (e.g. Blue on Blue, Purple on Purple, Midnight 80% on Rich Blue) as backgrounds.

Uses:
- Bold brand statement on devices and merchandise (bottles, bags, phone wallpapers).
- Forming the **silhouette of Saudi Arabia** to unite the brand with the nation.
- Forming a specific shape (e.g. a numeral) to draw attention to a message.
- A distinctive **backdrop** for content, e.g. presentation divider slides.

Rules: build patterns from the official arrow artwork (`assets/arrow/gosi-arrow.svg`, or use the ready-made pattern PNGs in `assets/patterns/`); keep arrows consistent in size within a grid; tone-on-tone backgrounds should be subtle so text stays legible; one pattern per composition.

---

## 6. Iconography

An ownable GOSI icon style built from the **geometry and curved details of the logotype** (e.g. the rounded corner from the "g"/"i" terminals).

Style traits:
- Monoline outline, uniform medium-heavy stroke.
- Mostly square/straight geometry with **one or two characteristic rounded corners**.
- Simple, open forms; little interior detail.
- Single color: White on Rich Blue, or Rich Blue on white; also available in other brand colors.

Official suite (use these names when mapping UI needs): Home, Security, Business, Business 2, Individuals, Individual M (Saudi male, ghutra), Individual F (Saudi female, hijab), Chat, Certified document, Search, Letter, Settings, Property, Strategy, Development, Partnership, Financial investment, Commitment, Email, Connect, Digital transformation, Segments, Risk, Cyber security, Insurance, Healthcare, Calendar, Add contact, Contact, Address, Information technology, Platforms / Channels, Values & culture, Benefits, Phone.

The official icons are in `assets/icons/white/` (for dark backgrounds) and `assets/icons/rich-blue/` (for light backgrounds), one PNG per icon at 512 px, named in kebab-case (e.g. `home.png`, `certified-document.png`, `individual-f.png`). Only when a needed concept is not in the suite, use a substitute outline icon with similar weight and rounded-corner details, and say it's a substitute.

---

## 7. Illustration

Ownable style sharing the logotype's geometry and curves:
- Flat vector, **Rich Blue line work** with **Vivid Green fills** (plus green tints and light grey).
- Clean, minimal, plenty of white space.
- People are Saudi characters in thobe & ghutra or abaya & hijab, drawn with simple lines, often holding a phone or document; ground shown as a single line.
- Objects as metaphors: magnifier over cards, signpost with green arrow-shaped signs, keys, padlocks, phones with UI cards and chat bubbles.

Reference artwork: `assets/illustrations/illustration-01.png` … `-03.png`. Use them as style references or, where licensing allows, directly.

For AI image prompts: *"clean flat vector illustration, navy #00004E line art, vivid green #00BF00 fills with light green tints, light grey accents, white background, minimal, friendly, Saudi characters in traditional dress, no text, no logos"*.

Note from the guideline: its images are placeholders for art direction only. Real photography and illustration must be commissioned or licensed for publication.

---

## 8. Applying the brand

### Slides / documents
- **Cover:** Rich Blue full-bleed, large Vivid Green arrow shape cropped on the right, white headline left, full-color reversed logo bottom-left.
- **Section divider:** solid Green, Blue or Purple with subtle tone-on-tone arrow pattern, `N.0  Section name` + large white headline.
- **Content page:** white or Midnight 10% background, Rich Blue text, running header (section no. + title left, page no. right), footer copyright bottom-left.
- **Closing:** Rich Blue with a single green arrow at the right edge.
- Logo top-left or bottom-left on covers; interior pages can skip the logo.

### UI screens (GOSI apps)
- Primary button: Vivid Green fill, **Rich Blue label**, fully rounded (pill), may end with `›`.
- Secondary button: Rich Blue outline or Rich Blue fill with white label.
- Text: Rich Blue headings, Midnight/Rich Blue body, Midnight 50% for secondary text.
- Surfaces: white cards on white or Midnight 10% backgrounds; subtle borders in Midnight 25%.
- Accents/links: Blue `#0064FF`. Status: use green tints for success.
- Use the GOSI outline icon style and the illustration style for empty states and onboarding.
- Support Arabic RTL as a first-class layout.

---

## 9. Asset library (`assets/`)

| Folder | Files | Use |
|---|---|---|
| `logo/` | `gosi-logo-primary-{color,reversed,white,black}.svg` (+ `.png` for color, reversed, white, black) | Main lockup. `color` on white/light, `reversed` (white + green arrow) on Rich Blue/Midnight, `white` on green or photos, `black` for B/W print. |
| `logo/` | `gosi-logo-descriptor-{color,reversed,white,black}.svg` (+ `.png` color, reversed) | Full-name lockup for formal documents. |
| `logo/` | `gosi-wordmark-{color,reversed,white,black}.svg` | gosi› only, for small or tight spaces. |
| `arrow/` | `gosi-arrow.svg` (uses `currentColor`), `gosi-arrow-{green,white,blue,purple,rich-blue,rich-blue-80}.svg` | The arrow from the logo. For cover shapes, cropped hero graphics, closing slides, pattern building. The arrow inside the logo itself stays green or mono. |
| `icons/white/`, `icons/rich-blue/` | 35 icons: add-contact, address, benefits, business, business-2, calendar, certified-document, chat, commitment, connect, contact, cyber-security, development, digital-transformation, email, financial-investment, healthcare, home, individual-f, individual-m, individuals, information-technology, insurance, letter, partnership, phone, platforms-channels, property, risk, search, security, segments, settings, strategy, values-culture | Official icon suite. |
| `patterns/` | `pattern-1c-green.png`, `pattern-1c-tint.png`, `pattern-1c-mixed.png`, `pattern-2c-green-blue.png`, `pattern-3c-green-blue-purple.png` (transparent PNGs, 2400 px) | Ready-made arrow patterns for backgrounds and merchandise-style statements. |
| `patterns/` | `ksa-map-2c.png` | Saudi Arabia silhouette made of arrows (green + blue). |
| `patterns/` | `graphic-device-green.png`, `arrow-individual-blue.png` | Single large arrow graphic devices. |
| `illustrations/` | `illustration-01.png` … `-03.png` | Official illustration style samples. |

Usage notes:
- Never recolor, stretch, add effects to, or crop the logo files. The arrow files may be scaled and cropped off the edge of a layout as a graphic device.
- In web pages, prefer inline SVG for logo and arrow so they stay sharp and can't fail to load.
- In Word/PowerPoint/PDF output, use the PNG versions where SVG isn't supported.

### Checklist before delivering
- [ ] Only official colors and their tints are used.
- [ ] Logo is the master file, correct version for the background, clear space and min size respected.
- [ ] Arrow is green (or mono), never re-colored.
- [ ] Text contrast is accessible (no small white text on green or purple).
- [ ] Ping (or the stated fallback) used consistently; sentence case.
- [ ] Tone is warm, reassuring and forward-looking.
