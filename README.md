# obsidianNNS
Obsidian Extension for rendering Nashville Number System charts using Chordtext

## Installation
1. `npm install && npm run build`
2. Copy `main.js`, `manifest.json` and `styles.css` into `<vault>/.obsidian/plugins/obsidian-nns/`.
3. Enable **NNS Charts** under Settings → Community plugins.

## Usage
Write a chart in a fenced `chordtext` (or `nns`) code block:

````markdown
```chordtext
Title: Amazing Grace
Artist: Traditional
Key: G
Tempo: 80
Time: 3/4

Intro:
1 1 4 1

Verse 1:
1 | 1 | 4 | 1
1 | 6- | 5 | 1

Chorus:
(1 4) 1/3 4maj7 5sus4
```
````

Notes whose frontmatter contains `nns: true` are rendered as a single chart (the whole note body is the ChordText).

Syntax notes (see `docs/PDF_RENDERING_PLAN.md` for what is and is not confirmed):
- `Key: value` metadata lines (title, artist, key, tempo, time).
- `Name:` starts a section (intro, verse, chorus, bridge, outro, anything else is custom).
- Whitespace separates bars; `|` is optional; `(1 4)` puts several chords in one bar.
- Chord extensions such as `maj7`, `-7`, `sus4` render as superscripts; `1/3` is a slash chord.
- Consecutive identical sections collapse to one with a `×N` marker.
- Invalid chords are shown in red and listed above the chart; the rest still renders.

### Export as PDF
Right-click a markdown note in the file explorer or editor and choose **Export as NNS chart PDF** (also available in the command palette). The PDF is written next to the note as `<note name>.pdf`. On mobile (or if Electron printing is unavailable) a notice is shown and a print-friendly view opens instead.

### Settings
Page size (Letter/A4), bars per row, columns (auto/1/2), minimum font size, and showing letter chords derived from the chart's Key. The layout fits to one page by trying two columns, then different bars per row, then a smaller font down to the minimum, then flowing onto further pages.

## Development
```
npm install
npm run dev     # watch build
npm run build   # type-check + production bundle
npm test        # vitest (parser + layout snapshot tests)
```
Source layout: `src/parser` (ChordText parser), `src/layout` (fit-to-page), `src/render` (HTML), `src/export` (PDF), `src/main.ts` (plugin).
