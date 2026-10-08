import type { Bar, Chart, ChartMeta, Chord, ParseError, Section, SectionKind } from "./types";

const META_KEYS: Record<string, keyof ChartMeta> = {
  title: "title",
  song: "title",
  artist: "artist",
  author: "artist",
  key: "key",
  tempo: "tempo",
  bpm: "tempo",
  time: "time",
  meter: "time",
};

const SECTION_ALIASES: Record<string, SectionKind> = {
  i: "intro",
  intro: "intro",
  v: "verse",
  verse: "verse",
  c: "chorus",
  chorus: "chorus",
  b: "bridge",
  bridge: "bridge",
  o: "outro",
  outro: "outro",
  end: "outro",
  ending: "outro",
};

const CHORD_RE = /^([b#]?)([1-7])(.*?)(?:\/([b#]?[1-7]))?$/;
const EXTENSION_RE = /^(?:-|\+|°|ø|maj|min|dim|aug|sus|add|m|[b#]?\d|~|\^|<|>|\.)*$/;

export function parseChord(raw: string): Chord | string {
  const m = CHORD_RE.exec(raw);
  if (!m) return `Not a chord: "${raw}"`;
  const extension = m[3];
  if (!EXTENSION_RE.test(extension)) return `Unknown chord extension "${extension}" in "${raw}"`;
  return {
    accidental: m[1] as Chord["accidental"],
    degree: Number(m[2]),
    extension,
    bass: m[4],
    raw,
  };
}

function parseBar(raw: string): Bar {
  const inner = raw.replace(/^\(|\)$/g, "").trim();
  const chords: Chord[] = [];
  for (const token of inner.split(/[\s,]+/).filter(Boolean)) {
    const c = parseChord(token);
    if (typeof c === "string") return { chords: [], raw, error: c };
    chords.push(c);
  }
  return { chords, raw };
}

function sectionKind(label: string): SectionKind {
  const name = label.toLowerCase().replace(/\s*\d+$/, "");
  return SECTION_ALIASES[name] ?? "custom";
}

const barsEqual = (a: Bar[], b: Bar[]) =>
  a.length === b.length && a.every((bar, i) => bar.raw.replace(/\s+/g, " ") === b[i].raw.replace(/\s+/g, " "));

/**
 * Parse ChordText. Never throws: problems are collected in `errors` and the
 * offending line or bar is skipped / rendered raw.
 */
export function parseChordText(text: string): Chart {
  const meta: ChartMeta = {};
  const sections: Section[] = [];
  const errors: ParseError[] = [];
  let current: Section | null = null;

  const lines = text.split(/\r?\n/);
  lines.forEach((rawLine, idx) => {
    const lineNo = idx + 1;
    const line = rawLine.replace(/\/\/.*$/, "").trim();
    if (!line) return;

    const header = /^([^:|\d\s][^:|]*?):\s*(.*)$/.exec(line) ?? /^\[([^\]]+)\]$/.exec(line);
    if (header && !/^[b#]?[1-7]/.test(line)) {
      const name = header[1].trim();
      const value = (header[2] ?? "").trim();
      if (value === "" || header.length === 2) {
        current = { kind: sectionKind(name), label: name, bars: [], repeat: 1 };
        sections.push(current);
        return;
      }
      const key = META_KEYS[name.toLowerCase()];
      if (key) meta[key] = value;
      else errors.push({ line: lineNo, message: `Unknown metadata "${name}"`, text: rawLine });
      return;
    }

    if (!current) {
      current = { kind: "custom", label: "", bars: [], repeat: 1 };
      sections.push(current);
    }
    const tokens = line.replace(/\|/g, " ").match(/\([^)]*\)|\S+/g) ?? [];
    for (const token of tokens) {
      const bar = parseBar(token);
      if (bar.error) errors.push({ line: lineNo, message: bar.error, text: rawLine });
      current.bars.push(bar);
    }
  });

  const collapsed: Section[] = [];
  for (const s of sections) {
    if (s.bars.length === 0) continue;
    const prev = collapsed[collapsed.length - 1];
    if (prev && prev.kind === s.kind && prev.label.replace(/\s*\d+$/, "") === s.label.replace(/\s*\d+$/, "") && barsEqual(prev.bars, s.bars)) {
      prev.repeat += 1;
    } else collapsed.push(s);
  }
  return { meta, sections: collapsed, errors };
}
