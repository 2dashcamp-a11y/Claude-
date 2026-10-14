# Design refinement pass (pre-WordPress)

This pass refines the existing design; it is not a redesign. The original version is preserved on the `backup/nextjs-v1-original` branch, at commit `4dd1b95`.

**Kept as it was:**
- the dark/light section rhythm and the eight-section structure
- the four service names and their positioning
- the $2,500/month starting price and its qualifier
- the hero headline and the editorial headlines
- the Discover → Design → Implement → Optimize framework
- the brand palette
- every waitlist field, validation rule, consent and backend behavior

No testimonials, stock photos, certifications or client results were added.

## What changed

### 1. Brand identity
- **Wordmark:** now reads `DASH ▬ of DIGITAL`. It combines a bold grotesk, a raised red dash, and an editorial serif italic "of", so the systems-plus-editorial pairing shows up in the logo itself.
- **Section folios:** a recurring marker (`01 ▬ The insight`, `02 ▬ Expertise` … `05 ▬ Early access`) gives the page a magazine-like structure. The red dash repeats across the site as a brand device.
- **Discipline colors:** Systems is lilac (the purple tint), Experiences is magenta, Creative is red. These are used the same way in the hero diagram, the discipline key and the service cards, so the accents carry meaning instead of decorating at random.
- **Type sizes:** small labels went from 12px to 13px. Body and supporting text is now 16–17px throughout, and footer links are 15px.
- **Red and magenta text:** lighter versions (`#EC6A60` coral, `#E8689C` rose) are used only for small text on dark cards, so it meets WCAG AA contrast. The core palette is unchanged.

### 2. Hero
- **Supporting copy:** rewritten so it names all three sides of the business (systems, digital experiences, creative direction), so visitors don't read DOD as an automation-only consultancy.
- **Discipline key:** a new row under the CTAs (Systems / Experiences / Creative) that also works as the diagram's legend.
- **Diagram:** nodes are grouped and colored by discipline, with larger labels (13px at full size), and two nodes added (Campaigns, Portal). On phones there's a separate, simplified six-node diagram with larger type, instead of the full diagram shrunk to unreadable 7px labels.
- **Layout:** the headline is sized to break cleanly ("Your business has / moving parts. / We make them / work together."). The space above and below the hero is tighter.

### 3. Services
- **Flagship card:** Technical Infrastructure Management is a full-width purple band. The price sits in its own panel with the main button directly below it, and the scope list has a "What's included" label.
- **The other three:** Audit, Experience and Brand are now equal cards in one row. Each has a discipline-colored top bar, a small line icon in the diagram's style, a large number, a discipline tag, 17px descriptions, a "What's included" list, and a full-width button.
- **Consistency:** scope-list wording is consistent (all items use "&"). Button sizes follow one hierarchy: the filled cream button is reserved for the flagship, and the other cards use an outlined pill.

### 4. Founder
- **Narrative:** reworked to connect the technical career (8 years, 1,000+ migration engagements, BILL) with the journalism, media, storytelling and design background.
- **Two separate track records:** the career figures sit under the label **"Founder's professional track record: earned in prior roles, before Dash of Digital"**, split into Technical and Creative halves. A separate panel says plainly that **Dash of Digital's own track record starts now** and that no client results are published yet.
- **Portrait:** still a typographic placeholder, now showing the "Systems ▬ story" pairing. It is replaced automatically when `siteConfig.founderPhoto` is set.
- **Vendor disclaimer:** kept.

### 5. Waitlist
- **Step 1, the essentials:** name, email, company and area of interest are the only fields shown at first.
- **Step 2, project details (optional):** website, stage, budget, timeline and biggest challenge sit in a section that starts collapsed. If one of those fields has an error, the section opens automatically and focus moves to that field.
- **Lighter layout:** the form card is lighter and the labels are 15px. The "What happens next" steps move below the form on phones.
- **Accuracy:** the "about a minute" note now mentions the required privacy confirmation, so it doesn't undercount the required fields.

### 6. Mobile
- **Every section checked at 375px and 390px**, with tighter vertical spacing.
- **Touch targets:** footer links, the timeline buttons (48px) and the service buttons (48px) are bigger.
- **Founder card:** shorter on phones.
- **Form header:** no longer wraps awkwardly on phones.
- **Motion:** the reduced-motion setting still turns off all animation.

## Could not be completed in this pass

- **A real founder portrait.** This needs a verified photo from you.
- **A final logo.** The wordmark is a refined typographic placeholder, not a commissioned logo.
- **Real devices.** Testing used headless Chromium. iPhone Safari and screen readers (VoiceOver/NVDA) still need a manual pass.
