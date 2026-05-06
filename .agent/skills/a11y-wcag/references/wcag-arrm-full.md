# WCAG ARRM Full Task List

Complete 254 tasks from W3C ARRM (Accessibility Roles and Responsibilities Mapping).

## Source Attribution

Based on W3C WAI ARRM (Draft) - January 2026
Licensed under CC BY 4.0

## Tasks by Category

### IMG - Images (22 tasks)

| ID      | Level | Task                                                                                | Main Role          |
| ------- | ----- | ----------------------------------------------------------------------------------- | ------------------ |
| IMG-001 | A     | Informative alternate text is provided for images                                   | Content Editor     |
| IMG-002 | A     | Informative images are described with clear and meaningful text equivalent          | Content Editor     |
| IMG-003 | A     | Purely decorative images are provided with null alt attribute values                | Markup Developer   |
| IMG-004 | A     | Null alt attribute values are used for images already described in adjacent content | Markup Developer   |
| IMG-005 | A     | Adjacent linked images and text links pointing same URL are combined                | Markup Developer   |
| IMG-006 | A     | Alt text for images of text include all relevant text found in image                | Content Editor     |
| IMG-007 | A     | Informative images are marked up as foreground images, not CSS                      | Markup Developer   |
| IMG-008 | A     | Purpose or function of complex images is accurately described in text               | Content Editor     |
| IMG-009 | A     | Purpose of complex images is conveyed using text description via alt                | Markup Developer   |
| IMG-010 | A     | Full explanation of complex images is accurately described                          | Content Editor     |
| IMG-011 | A     | Mechanism conveys way through which full explanation is defined                     | Designer           |
| IMG-012 | A     | Full explanation provided through longdesc attribute                                | Markup Developer   |
| IMG-013 | A     | Images conveying function use alt to describe purpose, not appearance               | Content Editor     |
| IMG-014 | A     | Text alternatives don't replicate info already conveyed by screen reader            | Content Editor     |
| IMG-015 | A     | Text alternatives of dynamically updated images are simultaneously updated          | Frontend Developer |
| IMG-016 | A     | Alternate means of accessing CAPTCHA are provided                                   | Designer           |
| IMG-017 | A     | Images which do not convey information are defined as decorative                    | Content Editor     |
| IMG-018 | A     | Charts, graphs, infographics don't rely on color alone                              | Designer           |
| IMG-019 | AA    | Text content that conveys information is not part of images                         | Designer           |
| IMG-020 | AA    | Text on top of image is handled through HTML/CSS instead                            | Markup Developer   |
| IMG-021 | AA    | Unless essential, images with text are only decorative                              | Designer           |
| IMG-022 | AAA   | With exception of logos, images with text are only decorative                       | Designer           |

### SEM - Semantics (29 tasks)

| ID      | Level | Task                                                           | Main Role          |
| ------- | ----- | -------------------------------------------------------------- | ------------------ |
| SEM-001 | A     | Informative content is provided through HTML markup            | Markup Developer   |
| SEM-002 | A     | HTML elements are used according to specification              | Markup Developer   |
| SEM-003 | A     | Navigation groupings marked up using HTML list or nav elements | Markup Developer   |
| SEM-004 | A     | Header sections marked up using HTML header elements           | Markup Developer   |
| SEM-005 | A     | Main section marked up using HTML main element                 | Markup Developer   |
| SEM-006 | A     | Footer marked up using HTML footer element                     | Markup Developer   |
| SEM-007 | A     | Complementary content marked up using HTML aside elements      | Markup Developer   |
| SEM-008 | A     | HTML elements used based on semantics, not appearance          | Markup Developer   |
| SEM-009 | A     | Decorative elements embedded through CSS                       | Markup Developer   |
| SEM-010 | A     | All scripting behaviors handled through JavaScript             | Frontend Developer |
| SEM-011 | A     | Elements acting as headings are marked up as such              | Markup Developer   |
| SEM-012 | A     | Headings follow hierarchical sequence without skipping levels  | Content Editor     |
| SEM-013 | A     | Headings marked up using h1-h6 elements                        | Markup Developer   |
| SEM-014 | A     | Page contains level 1 heading describing page content          | Markup Developer   |
| SEM-015 | A     | Whitespace not used to render multiple columns or tabular info | Markup Developer   |
| SEM-016 | A     | Use of native, semantic HTML elements prioritized              | Markup Developer   |
| SEM-017 | A     | Source code order matches suggested visual order               | Markup Developer   |
| SEM-018 | A     | iFrames displaying content provided with clear title attribute | Designer           |
| SEM-019 | A     | Page title text matches level 1 heading text                   | Content Editor     |
| SEM-020 | A     | Pages described using unique and descriptive page title values | Content Editor     |
| SEM-021 | A     | Tab order logically follows expected visual design order       | Markup Developer   |
| SEM-022 | AA    | Heading text meaningfully describes content topic or purpose   | Content Editor     |
| SEM-023 | AA    | Main heading describes content of page                         | Content Editor     |
| SEM-024 | A     | Source code properly nested according to specification         | Markup Developer   |
| SEM-025 | A     | Elements provided with complete start and end tags             | Markup Developer   |
| SEM-026 | A     | ID attribute values assigned to elements are unique            | Markup Developer   |
| SEM-027 | A     | Elements do not contain duplicate attributes                   | Markup Developer   |
| SEM-028 | A     | iFrames given title describing content or purpose              | Designer           |
| SEM-029 | A     | iFrames implemented using title attribute values               | Markup Developer   |

### INP - Input (25 tasks)

| ID      | Level | Task                                                             | Main Role          |
| ------- | ----- | ---------------------------------------------------------------- | ------------------ |
| INP-001 | AA    | Additional content triggered by focus/hover can be dismissed     | Designer           |
| INP-002 | AA    | Content triggered by hover doesn't disappear when moving pointer | Designer           |
| INP-003 | AA    | Content triggered by hover/focus stays visible until dismissed   | Designer           |
| INP-004 | A     | All actionable elements can be reached using only keyboard       | Frontend Developer |
| INP-005 | A     | All active elements can be triggered using only keyboard         | Frontend Developer |
| INP-006 | A     | Device-specific event handlers not used as only way              | Frontend Developer |
| INP-007 | A     | Behaviors for hover and focus states are planned and included    | Designer           |
| INP-008 | A     | Keyboard focus states planned for every active element           | Designer           |
| INP-009 | A     | Keyboard focus not applied to non-active or static elements      | Frontend Developer |
| INP-010 | A     | Custom elements replicate all native keyboard behaviors          | Frontend Developer |
| INP-011 | A     | Non-interactive elements not assigned JavaScript event handlers  | Frontend Developer |
| INP-012 | A     | Users can navigate away from all active elements                 | Markup Developer   |
| INP-013 | AAA   | All elements reachable without specific keystroke timings        | Designer           |
| INP-014 | A     | Single-key shortcuts can be disabled or remapped                 | Designer           |
| INP-015 | A     | Users can tab through elements in intended interaction order     | Markup Developer   |
| INP-016 | A     | Tabindex attributes not assigned positive integer values         | Markup Developer   |
| INP-017 | AA    | Every element receiving focus displays visible focus indicator   | Designer           |
| INP-018 | AA    | Every element receiving focus displays visible focus indicator   | Markup Developer   |
| INP-019 | A     | Multipoint/gesture functions have single-pointer alternatives    | Designer           |
| INP-020 | A     | Single pointer not triggered on down events (unless reversible)  | Designer           |
| INP-021 | A     | Text/images in UI control is part of accessible name             | Content Editor     |
| INP-022 | A     | Motion functions have alternative UI controls                    | Designer           |
| INP-023 | A     | Motion functionality can be turned off                           | Designer           |
| INP-024 | A     | Focus does not move automatically between form controls          | Designer           |
| INP-025 | AA    | Focus indicator area at least 2 CSS pixels                       | Designer           |

### FRM - Forms (39 tasks)

| ID      | Level | Task                                                         | Main Role          |
| ------- | ----- | ------------------------------------------------------------ | ------------------ |
| FRM-001 | A     | Text labels marked up using label element                    | Markup Developer   |
| FRM-002 | A     | Labels and form controls programmatically associated         | Markup Developer   |
| FRM-003 | A     | Submit buttons rely on submit input type or button element   | Markup Developer   |
| FRM-004 | A     | Related form controls associated using fieldset/legend       | Markup Developer   |
| FRM-005 | A     | Long option lists in select are grouped semantically         | Markup Developer   |
| FRM-006 | A     | Common group label text is informative and provides context  | Content Editor     |
| FRM-007 | A     | Instructions and messages conveyed to assistive technologies | Markup Developer   |
| FRM-008 | A     | Use of native HTML controls prioritized                      | Markup Developer   |
| FRM-009 | A     | Required fields programmatically conveyed to AT              | Markup Developer   |
| FRM-010 | A     | Instructions on form use conveyed to AT                      | Markup Developer   |
| FRM-011 | A     | Relevant form info does not appear after submit button       | Designer           |
| FRM-012 | AA    | Data entry fields autofill previously entered info           | Designer           |
| FRM-013 | AA    | Autocomplete attribute set to appropriate value              | Markup Developer   |
| FRM-014 | AAA   | Purpose of UI components implemented via markup              | Markup Developer   |
| FRM-015 | A     | Focus dynamically moved to error message when returned       | Frontend Developer |
| FRM-016 | AA    | Purpose of form control clearly described in text            | Content Editor     |
| FRM-017 | AAA   | Content doesn't restrict input modalities                    | Designer           |
| FRM-018 | A     | Changes of context not initiated on focus                    | Designer           |
| FRM-019 | A     | Event handlers don't auto-trigger context change on input    | Frontend Developer |
| FRM-020 | A     | Forms not designed to auto context change on input           | Designer           |
| FRM-021 | A     | Error messages visually displayed consistently               | Designer           |
| FRM-022 | A     | Visual indicators support error messages                     | Designer           |
| FRM-023 | A     | Inline errors displayed next to related controls             | Designer           |
| FRM-024 | A     | Error messages grouped as list at top of form                | Designer           |
| FRM-025 | A     | Radio/checkbox labels positioned to right of controls (LTR)  | Designer           |
| FRM-026 | A     | Related controls and labels grouped visually                 | Designer           |
| FRM-027 | A     | Instructions in close visual proximity to controls           | Designer           |
| FRM-028 | A     | Form controls coded to have persistent visual labels         | Markup Developer   |
| FRM-029 | A     | Form controls designed to have persistent visual labels      | Designer           |
| FRM-030 | A     | Clear instructions provided on how to use form controls      | Content Editor     |
| FRM-031 | A     | Form instructions displayed clearly and unambiguously        | Designer           |
| FRM-032 | A     | Placeholder text not used in lieu of regular labels          | Designer           |
| FRM-033 | AA    | Error messages provide clear instructions on how to fix      | Content Editor     |
| FRM-034 | AA    | Instructions to prevent errors are provided                  | Frontend Developer |
| FRM-035 | AA    | Text-based instructions help users correct errors            | Designer           |
| FRM-036 | AA    | Means to prevent/correct errors for legal/financial data     | Designer           |
| FRM-037 | AA    | Confirmation screens provided for legal/financial submission | Designer           |
| FRM-038 | AAA   | Context-sensitive help text is available                     | Designer           |
| FRM-039 | AAA   | Means to prevent/correct all form errors                     | Designer           |

### CSS - Styles (23 tasks)

| ID      | Level | Task                                                     | Main Role          |
| ------- | ----- | -------------------------------------------------------- | ------------------ |
| CSS-001 | A     | Icon fonts conveying info provided with text equivalent  | Designer           |
| CSS-002 | A     | Icon font meaning determined via aria-label              | Markup Developer   |
| CSS-003 | A     | Icon fonts with incorrect default name use aria-hidden   | Markup Developer   |
| CSS-004 | A     | Decorative background images implemented as such         | Frontend Developer |
| CSS-005 | A     | CSS ::before/::after not used for informative content    | Markup Developer   |
| CSS-006 | A     | Shape and location never used as only way to convey info | Designer           |
| CSS-007 | A     | High Contrast theme users don't lose information         | Markup Developer   |
| CSS-008 | AA    | Content viewable in both portrait and landscape          | Designer           |
| CSS-009 | A     | Color never used as only way to convey information       | Designer           |
| CSS-010 | A     | Link text color 3:1 contrast vs surrounding text         | Designer           |
| CSS-011 | AA    | Regular text 4.5:1 contrast against background           | Designer           |
| CSS-012 | AA    | Large text 3:1 contrast against background               | Designer           |
| CSS-013 | AA    | Users can resize text up to 200% without loss            | Designer           |
| CSS-014 | AA    | CSS ensures no overflow/overlap when resizing            | Markup Developer   |
| CSS-015 | AA    | CSS sprites don't include text-as-image                  | Markup Developer   |
| CSS-016 | AAA   | Regular text 7:1 contrast                                | Designer           |
| CSS-017 | AAA   | Large text 4.5:1 contrast                                | Designer           |
| CSS-018 | AA    | Design allows text reflow to single column               | Designer           |
| CSS-019 | AA    | No multidirectional scrolling on narrow screens          | Designer           |
| CSS-020 | AA    | Non-text UI and graphics 3:1 contrast                    | Designer           |
| CSS-021 | AA    | Spacing adjustment doesn't cause loss of content         | Designer           |
| CSS-022 | AA    | CSS outline not set to zero or none for focused objects  | Frontend Developer |
| CSS-023 | AAA   | Interactive elements at least 44x44 pixels               | Designer           |

### NAV - Navigation (31 tasks)

| ID      | Level | Task                                                        | Main Role          |
| ------- | ----- | ----------------------------------------------------------- | ------------------ |
| NAV-001 | A     | Active objects and CTAs visually identifiable               | Designer           |
| NAV-002 | A     | Instructions conveyed through more than shape/size/position | Content Editor     |
| NAV-003 | A     | Additional cues provided when color conveys info            | Designer           |
| NAV-004 | A     | Users notified when time limits about to expire             | Designer           |
| NAV-005 | A     | Options to extend or turn off time limits provided          | Designer           |
| NAV-006 | A     | Means to pause/stop auto-updating content provided          | Designer           |
| NAV-007 | AAA   | Means to turn off all updates except emergencies            | Designer           |
| NAV-008 | AAA   | Means to re-authenticate without data loss                  | Designer           |
| NAV-009 | A     | Users can bypass blocks using skip links                    | Designer           |
| NAV-010 | A     | Skip links at effective location (first tab stop)           | Designer           |
| NAV-011 | A     | Skip link functionality and destination clearly defined     | Designer           |
| NAV-012 | A     | Skip links point to expected destination                    | Markup Developer   |
| NAV-013 | A     | All active elements receive focus in logical order          | Frontend Developer |
| NAV-014 | A     | Logical focus order defined for complex interactions        | Designer           |
| NAV-015 | A     | Non-actionable objects not in tabbing order                 | Markup Developer   |
| NAV-016 | A     | Focus returns to trigger when modal dismissed               | Frontend Developer |
| NAV-017 | A     | Event handlers don't unexpectedly move focus                | Frontend Developer |
| NAV-018 | A     | Link text describes destination or purpose                  | Content Editor     |
| NAV-019 | A     | Links marked up using anchor element with valid href        | Markup Developer   |
| NAV-020 | AA    | Multiple wayfinding mechanisms provided                     | Designer           |
| NAV-021 | AAA   | Indications help users identify current location            | Designer           |
| NAV-022 | AAA   | Link purpose identifiable from context or text alone        | Content Editor     |
| NAV-023 | AAA   | Content logically organized using section headings          | Content Editor     |
| NAV-024 | A     | Focus on element doesn't auto-trigger context change        | Designer           |
| NAV-025 | A     | Input controls don't auto-trigger context change            | Designer           |
| NAV-026 | AA    | Navigation mechanisms repeated consistently                 | Designer           |
| NAV-027 | AA    | Navigational icons always serve same function               | Designer           |
| NAV-028 | AA    | Accessible names defined consistently                       | Content Editor     |
| NAV-029 | AA    | Users can distinguish internal vs external links            | Designer           |
| NAV-030 | AAA   | Links opening new windows visually indicate                 | Designer           |
| NAV-031 | AAA   | Links opening new windows indicate via text or aria-label   | Markup Developer   |

### TAB - Tables (17 tasks)

| ID      | Level | Task                                                | Main Role          |
| ------- | ----- | --------------------------------------------------- | ------------------ |
| TAB-001 | A     | Tables only used for tabular information/data       | Markup Developer   |
| TAB-002 | A     | Table row/column headers provide context for data   | Designer           |
| TAB-003 | A     | Data table structure appropriate for data           | Designer           |
| TAB-004 | A     | Tabular data and headers are part of same table     | Markup Developer   |
| TAB-005 | A     | Header cells for rows marked up using THEAD         | Markup Developer   |
| TAB-006 | A     | Header cells for columns marked up using TH         | Markup Developer   |
| TAB-007 | A     | Simple table relationships via SCOPE attributes     | Markup Developer   |
| TAB-008 | A     | Complex table relationships via HEADERS and ID      | Markup Developer   |
| TAB-009 | A     | Caption elements associate caption with data tables | Markup Developer   |
| TAB-010 | A     | Large, complex tables broken into smaller ones      | Designer           |
| TAB-011 | A     | Unrelated data not in same table                    | Designer           |
| TAB-012 | A     | Tables not used for layout purposes                 | Frontend Developer |
| TAB-013 | A     | Tables not used to layout lists                     | Frontend Developer |
| TAB-014 | A     | Caption/aria-labelledby explains table structure    | Markup Developer   |
| TAB-015 | A     | Meaningful description of table structure provided  | Content Editor     |
| TAB-016 | A     | Programmatic order matches intended reading order   | Markup Developer   |
| TAB-017 | AA    | All data table header cells identified              | Designer           |

### ANM - Audio/Media (37 tasks)

| ID      | Level | Task                                                           | Main Role          |
| ------- | ----- | -------------------------------------------------------------- | ------------------ |
| ANM-001 | A     | Text transcripts provided for prerecorded audio-only           | Content Editor     |
| ANM-002 | A     | Text transcripts provided for prerecorded video-only           | Content Editor     |
| ANM-003 | A     | Links to transcripts in close proximity to media               | Designer           |
| ANM-004 | A     | Relationship between media and transcript clearly communicated | Designer           |
| ANM-005 | A     | Copy identifies when video has no sound                        | Designer           |
| ANM-006 | A     | Further info about media provided in proximity                 | Designer           |
| ANM-007 | A     | Synchronized captions for all prerecorded video                | Content Editor     |
| ANM-008 | A     | Captions don't skip dialogues or important sounds              | Content Editor     |
| ANM-009 | A     | Media player controls to turn captions on/off                  | Designer           |
| ANM-010 | A     | Transcripts report all significant audio info                  | Content Editor     |
| ANM-011 | A     | Transcripts or audio descriptions report visual info           | Content Editor     |
| ANM-012 | AA    | Synchronized captions for live video                           | Content Editor     |
| ANM-013 | AA    | Live captions via real-time transcription                      | Content Editor     |
| ANM-014 | AA    | Prerecorded videos have audio descriptions                     | Content Editor     |
| ANM-015 | AA    | Controls to toggle audio descriptions                          | Designer           |
| ANM-016 | AA    | Controls to access audio description version                   | Designer           |
| ANM-017 | AAA   | Sign language interpretation for prerecorded audio             | Content Editor     |
| ANM-018 | AAA   | Extended audio description when pauses insufficient            | Content Editor     |
| ANM-019 | AAA   | Text alternatives for all prerecorded audio/video              | Content Editor     |
| ANM-020 | AAA   | Brief descriptions summarizing media content                   | Designer           |
| ANM-021 | AAA   | Live transcripts for real-time audio                           | Content Editor     |
| ANM-022 | A     | Media player controls to turn sound on/off                     | Designer           |
| ANM-023 | A     | Volume controls independent from system audio                  | Frontend Developer |
| ANM-024 | A     | Volume controls visually at top of page                        | Designer           |
| ANM-025 | A     | Auto-start audio lasts no longer than 3 seconds                | Markup Developer   |
| ANM-026 | A     | Video not set to auto-play                                     | Designer           |
| ANM-027 | AAA   | Audio-only background sounds controllable                      | Designer           |
| ANM-028 | AAA   | Audio speeches have background 20dB lower                      | Content Editor     |
| ANM-029 | A     | Media player controls keyboard operable                        | Frontend Developer |
| ANM-030 | A     | Controls to pause or play media                                | Designer           |
| ANM-031 | AAA   | Timing not essential to content                                | Designer           |
| ANM-032 | AAA   | Users warned about data loss after 20hr inactivity             | Designer           |
| ANM-033 | A     | No flashing more than 3 times per second                       | Designer           |
| ANM-034 | AAA   | No flashing higher than 3 times per second                     | Designer           |
| ANM-035 | AAA   | Motion animations can be disabled                              | Designer           |
| ANM-036 | AAA   | Animations support prefers-reduced-motion                      | Frontend Developer |
| ANM-037 | A     | Media player controls announced to AT                          | Markup Developer   |

### SCT - Content (29 tasks)

| ID      | Level | Task                                                      | Main Role          |
| ------- | ----- | --------------------------------------------------------- | ------------------ |
| SCT-001 | A     | Emoticons, emojis, ASCII art have text alternatives       | Designer           |
| SCT-002 | A     | Emoticons not used as only way to convey info             | Designer           |
| SCT-003 | A     | Proper markup for emphasized, bold text                   | Markup Developer   |
| SCT-004 | A     | Proper markup for quotes, blockquotes, citations          | Markup Developer   |
| SCT-005 | A     | Heading markup only for actual section headings           | Markup Developer   |
| SCT-006 | A     | Heading markup not used for formatting effects            | Markup Developer   |
| SCT-007 | A     | Headings provide logical document outline                 | Content Editor     |
| SCT-008 | A     | Intended reading order logical with CSS/images off        | Markup Developer   |
| SCT-009 | A     | Source code order reflects intended reading order         | Markup Developer   |
| SCT-010 | A     | Site supports internationalization/RTL languages          | Business Analyst   |
| SCT-011 | A     | Text direction properly marked for RTL languages          | Frontend Developer |
| SCT-012 | A     | Shape-dependent objects have additional text info         | Designer           |
| SCT-013 | A     | Size-dependent objects have additional text info          | Designer           |
| SCT-014 | A     | Location-dependent objects have additional text info      | Designer           |
| SCT-015 | A     | Orientation-dependent objects have additional text info   | Designer           |
| SCT-016 | A     | Sound-dependent objects have additional text info         | Designer           |
| SCT-017 | AA    | Mathematical formulas marked up using MathML              | Markup Developer   |
| SCT-018 | AAA   | Text content left-aligned in LTR languages                | Designer           |
| SCT-019 | AAA   | Fully justified text can be changed to ragged right       | Designer           |
| SCT-020 | A     | Primary document language identified via lang attribute   | Markup Developer   |
| SCT-021 | A     | Language definition uses correct value for locale         | Content Editor     |
| SCT-022 | AA    | Different language passages identified                    | Content Editor     |
| SCT-023 | AAA   | Unusual words organized into glossary                     | Designer           |
| SCT-024 | AAA   | Unusual words linked to definitions                       | Designer           |
| SCT-025 | AAA   | Abbreviations programmatically associated with definition | Markup Developer   |
| SCT-026 | AAA   | Content written in plain language                         | Content Editor     |
| SCT-027 | AAA   | Ideas supported with illustrations                        | Designer           |
| SCT-028 | AAA   | Content structured for easier reading                     | Designer           |
| SCT-029 | AAA   | Ambiguous words have pronunciation mechanism              | Designer           |

### DYN - Dynamic (3 tasks)

| ID      | Level | Task                                              | Main Role        |
| ------- | ----- | ------------------------------------------------- | ---------------- |
| DYN-001 | AA    | Media player controls announced to AT             | Markup Developer |
| DYN-002 | AA    | Status messages announced without affecting focus | Designer         |
| DYN-003 | AA    | Status/toast messages use ARIA roles/properties   | Markup Developer |
