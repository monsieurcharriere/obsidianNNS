import { describe, expect, it } from "vitest";
import { parseChord } from "../src/parser";
import type { Chord } from "../src/parser";
import { letterFor } from "../src/render/letters";

const c = (raw: string) => parseChord(raw) as Chord;

describe("letterFor", () => {
  it.each([
    ["1", "G", "G"],
    ["4", "G", "C"],
    ["5", "F", "C"],
    ["4", "Bb", "Eb"],
    ["b7", "G", "F"],
    ["#4", "C", "F#"],
    ["6-7", "D", "B-7"],
    ["1/3", "C", "C/E"],
    ["1/b7", "G", "G/F"],
  ])("%s in %s = %s", (raw, key, letter) => {
    expect(letterFor(c(raw), key)).toBe(letter);
  });
  it("returns null for unusable keys", () => {
    expect(letterFor(c("1"), "H")).toBeNull();
    expect(letterFor(c("1"), undefined)).toBeNull();
  });
});
