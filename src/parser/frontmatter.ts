export interface FrontmatterSplit {
  frontmatter: string | null;
  body: string;
  /** Number of lines removed from the top of the text. */
  bodyOffset: number;
}

export function splitFrontmatter(text: string): FrontmatterSplit {
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(text);
  if (!m) return { frontmatter: null, body: text, bodyOffset: 0 };
  return {
    frontmatter: m[1],
    body: text.slice(m[0].length),
    bodyOffset: m[0].split("\n").length - 1,
  };
}

/** True when frontmatter contains `nns: true`. */
export function isNnsFrontmatter(frontmatter: string | null): boolean {
  return frontmatter !== null && /^nns:\s*(true|yes)\s*$/im.test(frontmatter);
}

/** Extract bodies of ```chordtext / ```nns fenced blocks. */
export function extractChartBlocks(text: string): string[] {
  const re = /^(```|~~~)[ \t]*(?:chordtext|nns)[ \t]*\r?\n([\s\S]*?)^\1[ \t]*$/gm;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push(m[2]);
  return out;
}
