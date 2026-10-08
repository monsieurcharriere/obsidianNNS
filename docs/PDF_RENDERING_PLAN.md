# PDF Rendering Plan (design only – no code yet)

> Note: jotchord.com was not reachable from the sandbox, so the input syntax
> below is an *assumed* JotChord-like grammar. Verify it against the
> [reference guide](https://www.jotchord.com/reference-guide) and
> [quick reference](https://www.jotchord.com/quick-reference-guide) before
> implementing the parser.

## 1. Goals
- Obsidian plugin turns a fenced code block (e.g. ```` ```nns ````) or a whole note into a clean one/two-page Nashville Number System chart.
- Same text drives live preview in Obsidian and PDF export, so the output is identical.
- Sections (Intro, Verse, Chorus, Bridge, Outro…) are visually distinct and never split awkwardly across pages.

## 2. Pipeline
```
text → Lexer/Parser → AST → Layout engine → HTML/CSS (print) → PDF
```
1. **Parser** (pure TypeScript, no Obsidian deps, unit-testable).
2. **AST** (below).
3. **Layout engine** measures and arranges bars into rows and sections into columns/pages.
4. **Renderer** emits semantic HTML + a print stylesheet. The same DOM is shown in the Obsidian view.
5. **PDF export**: use Obsidian's built-in `electron` `webContents.printToPDF` (desktop) on a hidden view of that HTML. No bundled PDF library needed; fallback option: `jsPDF`/`pdf-lib` if direct control is needed. Mobile: use the "Print/Export to PDF" of the rendered note.

## 3. Input grammar (to confirm against JotChord)
- **Metadata header**: `Title:`, `Artist:`, `Key:`, `Tempo:`, `Time:`, `Capo:`.
- **Section headers**: a line like `Verse 1`, `[Chorus]` or `Chorus:`; recognised names (intro, verse, pre-chorus, chorus, bridge, instrumental, solo, tag, outro) are matched case-insensitively; unknown names are accepted as custom sections.
- **Chord lines**: numbers `1–7` with modifiers (`b`/`#` prefix, `m`, `7`, `maj7`, `sus4`, `/` bass, `-` minor, etc.), grouped into bars separated by `|`. Multiple chords in a bar share its width.
- **Repeats / endings**: `x2`, `||: :||`, 1st/2nd ending.
- **Rhythm/feel marks**: stabs/push `^`, hold `<>`, rests, fermata.
- **Lyrics / notes**: plain text lines under a chord line; `(…)` comments.
- **Section reuse**: referring to a previously defined section by name (e.g. `Chorus` alone) repeats it, optionally collapsed.
- Transposition: `Key:` is only used to optionally show letter chords; numbers are stored as the source of truth.

## 4. AST
```
Chart { meta, sections[] }
Section { type, label, repeat?, lines[] }
Line  = BarLine { bars[], lyrics? } | LyricLine | Comment
Bar   { chords[], repeatStart?, repeatEnd?, ending? }
Chord { degree, accidental, quality, extensions, bass?, marks[] }
```
Parse errors are collected (line/col) and shown inline rather than aborting.

## 5. Layout rules for clean charts
- **Page**: Letter/A4 selectable, ~0.5" margins; header (title, artist, key, tempo, time) on page 1; small running header on later pages.
- **Bars grid**: fixed N bars per row (default 4, configurable, 8 for dense charts). Bar widths are equal so bar lines align vertically through the chart; chords inside a bar are spaced proportionally.
- **Section blocks**: each section is an unbreakable block (`break-inside: avoid`) with a left-hand label column (bold section name) and the bar grid at right. Sections taller than a page are split only on row boundaries.
- **Columns**: single column by default; auto two-column mode when a chart would otherwise exceed one page (use CSS multi-column or grid with `break-inside: avoid`), balancing by section height.
- **Fit-to-page**: if content overflows, try in order: two columns → smaller bars-per-row increase → reduce font scale (min ~9pt). Never shrink below the minimum; overflow goes to a new page.
- **Repeated sections**: collapse into "Chorus (x2)" references once defined, with a toggle to expand.
- **Typography**: monospace/tabular numerals for chords, superscript for extensions/qualities, bold large degrees; lyrics in a lighter proportional font; section labels as small-caps.
- **Distinct section styling**: subtle left border / tint per section type, print-friendly (greyscale safe).
- Style is driven by CSS variables so users can tweak font size, bars per row, and theme (light-only for print).

## 6. Obsidian integration
- `registerMarkdownCodeBlockProcessor("nns", …)` renders the chart inline.
- Command "Export current chart/note to PDF" and a ribbon button; settings tab (page size, bars/row, columns, key display).
- Source layout: `src/parser/`, `src/layout/`, `src/render/`, `src/export/`, `src/main.ts`; build with esbuild per the Obsidian sample plugin.

## 7. Testing
- Parser: table-driven unit tests (Jest/Vitest) over example charts and error cases.
- Layout: snapshot tests of the HTML for fixture charts.
- Visual: render fixtures to PDF and compare page counts / manual review against JotChord output.

## 8. Milestones
1. Scaffold plugin from sample template; confirm grammar from JotChord docs.
2. Parser + AST + tests.
3. HTML renderer + inline code-block view.
4. Print CSS + section/page-break layout.
5. PDF export command + settings.
6. Repeats, endings, rhythm marks, transposition, polish.
