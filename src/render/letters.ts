import type { Chord } from "../parser/types";

const SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const FLAT_KEYS = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"]);

function tonic(key: string): { index: number; flats: boolean } | null {
  const m = /^([A-Ga-g])([b#]?)/.exec(key.trim());
  if (!m) return null;
  const name = m[1].toUpperCase() + m[2];
  let index = SHARP.indexOf(name);
  if (index < 0) index = FLAT.indexOf(name);
  if (index < 0) return null;
  return { index, flats: FLAT_KEYS.has(name) || name.endsWith("b") };
}

function note(key: { index: number; flats: boolean }, accidental: string, degree: number): string {
  const shift = accidental === "b" ? -1 : accidental === "#" ? 1 : 0;
  const i = (((key.index + MAJOR[degree - 1] + shift) % 12) + 12) % 12;
  return (key.flats ? FLAT : SHARP)[i];
}

/** Letter name for a chord in the given key, or null when the key is unusable. */
export function letterFor(chord: Chord, key: string | undefined): string | null {
  const t = key ? tonic(key) : null;
  if (!t) return null;
  let out = note(t, chord.accidental, chord.degree) + chord.extension;
  if (chord.bass) out += "/" + note(t, /^[b#]/.test(chord.bass) ? chord.bass[0] : "", Number(chord.bass.slice(-1)));
  return out;
}
