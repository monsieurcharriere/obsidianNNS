# PDF rendering plan

## Grammar status

The `chordtext` npm package does **not** exist on the npm registry (`npm view chordtext` returns 404), so it cannot be bundled. The parser in `src/parser/` is therefore our own implementation.

The official ChordText / JotChord reference (jotchord.com) could not be reached from the build environment, so **the grammar has not been verified against the official specification**. Only the following is what this parser implements; treat it as a working assumption, not a confirmed spec:

- `Key: value` metadata: title, artist, key, tempo, time (aliases: song, author, bpm, meter).
- `Name:` or `[Name]` on its own line starts a section.
- Chord tokens: optional `b`/`#`, degree 1–7, extension, optional `/bass`.
- Whitespace-separated tokens are bars; `|` is cosmetic; `(a b)` groups chords in one bar.
- `//` starts a comment.

Not implemented: repeats/codas, rhythm marks, push/hold symbols, and any other official feature.

## Milestones

- [x] Plugin scaffold (manifest, esbuild, tsconfig, styles)
- [x] Parser adapter with collected errors, Vitest table tests
- [x] HTML renderer, snapshot tests
- [x] Inline rendering (`chordtext`/`nns` blocks, `nns: true` notes)
- [x] Export UI (file menu, editor menu, command) and Electron `printToPDF`, with print-view fallback
- [x] Settings tab
- [x] Fit-to-page heuristics (estimated, not measured)
- [ ] Verify grammar against the official ChordText reference
- [ ] Manual testing in Obsidian desktop/mobile
