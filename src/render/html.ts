import type { Bar, Chart, Chord } from "../parser/types";
import { letterFor } from "./letters";

export interface RenderOptions {
  barsPerRow: number;
  columns: 1 | 2;
  fontSize: number;
  showLetters: boolean;
}

export const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function chordHtml(c: Chord, key: string | undefined, showLetters: boolean): string {
  const ext = c.extension ? `<sup class="nns-ext">${escapeHtml(c.extension)}</sup>` : "";
  const bass = c.bass ? `<span class="nns-bass">/${escapeHtml(c.bass)}</span>` : "";
  const letter = showLetters ? letterFor(c, key) : null;
  const letterHtml = letter ? `<span class="nns-letter">${escapeHtml(letter)}</span>` : "";
  return `<span class="nns-chord">${escapeHtml(c.accidental)}${c.degree}${ext}${bass}${letterHtml}</span>`;
}

function barHtml(bar: Bar, key: string | undefined, showLetters: boolean): string {
  if (bar.error) return `<div class="nns-bar nns-bar-error" title="${escapeHtml(bar.error)}">${escapeHtml(bar.raw)}</div>`;
  const multi = bar.chords.length > 1 ? " nns-bar-split" : "";
  return `<div class="nns-bar${multi}">${bar.chords.map((c) => chordHtml(c, key, showLetters)).join("")}</div>`;
}

export function renderChartHtml(chart: Chart, opts: RenderOptions): string {
  const { meta } = chart;
  const parts: string[] = [];
  parts.push(
    `<article class="nns-chart" style="--nns-bars:${opts.barsPerRow};--nns-columns:${opts.columns};--nns-font-size:${opts.fontSize}px">`
  );
  const facts: Array<[string, string | undefined]> = [
    ["Artist", meta.artist],
    ["Key", meta.key],
    ["Tempo", meta.tempo],
    ["Time", meta.time],
  ];
  parts.push(`<header class="nns-header">`);
  if (meta.title) parts.push(`<h1 class="nns-title">${escapeHtml(meta.title)}</h1>`);
  const shown = facts.filter(([, v]) => v);
  if (shown.length) {
    parts.push(
      `<dl class="nns-meta">${shown
        .map(([k, v]) => `<div class="nns-meta-item nns-meta-${k.toLowerCase()}"><dt>${k}</dt><dd>${escapeHtml(v as string)}</dd></div>`)
        .join("")}</dl>`
    );
  }
  parts.push(`</header>`);
  if (chart.errors.length) {
    parts.push(
      `<ul class="nns-errors">${chart.errors
        .map((e) => `<li class="nns-error">Line ${e.line}: ${escapeHtml(e.message)}</li>`)
        .join("")}</ul>`
    );
  }
  parts.push(`<div class="nns-body">`);
  for (const s of chart.sections) {
    const repeat = s.repeat > 1 ? `<span class="nns-repeat">×${s.repeat}</span>` : "";
    parts.push(
      `<section class="nns-section nns-section-${s.kind}">` +
        `<div class="nns-label">${escapeHtml(s.label)}${repeat}</div>` +
        `<div class="nns-bars">${s.bars.map((b) => barHtml(b, meta.key, opts.showLetters)).join("")}</div>` +
        `</section>`
    );
  }
  parts.push(`</div></article>`);
  return parts.join("\n");
}
