export type SectionKind = "intro" | "verse" | "chorus" | "bridge" | "outro" | "custom";

export interface Chord {
  accidental: "" | "b" | "#";
  degree: number;
  /** Everything after the degree (e.g. "-7", "maj7", "sus4"), rendered as a superscript. */
  extension: string;
  /** Slash bass, e.g. "5" or "b7". */
  bass?: string;
  raw: string;
}

export interface Bar {
  chords: Chord[];
  raw: string;
  /** Set when the bar could not be parsed; the raw text is rendered instead. */
  error?: string;
}

export interface Section {
  kind: SectionKind;
  label: string;
  bars: Bar[];
  /** Number of consecutive identical sections collapsed into this one. */
  repeat: number;
}

export interface ChartMeta {
  title?: string;
  artist?: string;
  key?: string;
  tempo?: string;
  time?: string;
}

export interface ParseError {
  line: number;
  message: string;
  text: string;
}

export interface Chart {
  meta: ChartMeta;
  sections: Section[];
  errors: ParseError[];
}
