import { describe, expect, it } from "vitest";
import { parseChord, parseChordText, splitFrontmatter, isNnsFrontmatter, extractChartBlocks } from "../src/parser";
import { amazingGrace, brokenChart } from "./fixtures/amazing-grace";

describe("parseChord", () => {
  const cases: Array<[string, string, number, string, string | undefined]> = [
    ["1", "", 1, "", undefined],
    ["6-", "", 6, "-", undefined],
    ["b7", "b", 7, "", undefined],
    ["#4maj7", "#", 4, "maj7", undefined],
    ["1/3", "", 1, "", "3"],
    ["5sus4", "", 5, "sus4", undefined],
    ["4add9/b7", "", 4, "add9", "b7"],
  ];
  it.each(cases)("%s", (raw, accidental, degree, extension, bass) => {
    expect(parseChord(raw)).toEqual({ accidental, degree, extension, bass, raw });
  });
  it.each(["8", "H", "0", "1xyz"])("rejects %s", (raw) => {
    expect(typeof parseChord(raw)).toBe("string");
  });
});

describe("parseChordText", () => {
  it("reads metadata and sections", () => {
    const chart = parseChordText(amazingGrace);
    expect(chart.errors).toEqual([]);
    expect(chart.meta).toEqual({ title: "Amazing Grace", artist: "Traditional", key: "G", tempo: "80", time: "3/4" });
    expect(chart.sections.map((s) => [s.kind, s.label, s.bars.length, s.repeat])).toEqual([
      ["intro", "Intro", 4, 1],
      ["verse", "Verse 1", 8, 2],
      ["chorus", "Chorus", 8, 1],
      ["outro", "Outro", 2, 1],
    ]);
  });
  it("treats parenthesised chords as one bar", () => {
    const bar = parseChordText("C:\n(1 4)").sections[0].bars[0];
    expect(bar.chords.map((c) => c.degree)).toEqual([1, 4]);
  });
  it("collects errors without failing", () => {
    const chart = parseChordText(brokenChart);
    expect(chart.errors.map((e) => [e.line, e.message.slice(0, 12)])).toEqual([
      [3, "Not a chord:"],
      [4, "Unknown meta"],
      [5, "Unknown chor"],
    ]);
    expect(chart.sections[0].bars.filter((b) => b.error)).toHaveLength(2);
  });
  it("never throws on junk", () => {
    expect(() => parseChordText("::\n|||\n(((\n\u0000")).not.toThrow();
  });
});

describe("frontmatter", () => {
  it("detects nns flag and body", () => {
    const s = splitFrontmatter("---\nnns: true\n---\n1 4 5\n");
    expect(isNnsFrontmatter(s.frontmatter)).toBe(true);
    expect(s.body).toBe("1 4 5\n");
    expect(s.bodyOffset).toBe(3);
  });
  it("extracts chordtext and nns blocks", () => {
    const text = "x\n```chordtext\n1 4\n```\n```js\nno\n```\n```nns\n5 1\n```\n";
    expect(extractChartBlocks(text)).toEqual(["1 4\n", "5 1\n"]);
  });
});
