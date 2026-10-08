import type { Chart } from "../parser/types";
import type { NnsSettings } from "../settings";

export interface LayoutPlan {
  columns: 1 | 2;
  barsPerRow: number;
  fontSize: number;
  pages: number;
}

export const BASE_FONT_SIZE = 18;
const PAGE_INCHES = { Letter: [8.5, 11], A4: [8.27, 11.69] } as const;
const MARGIN_IN = 0.5;
const PX_PER_IN = 96;
const LABEL_EM = 5;
const MIN_BAR_EM = 2.5;

function usable(pageSize: NnsSettings["pageSize"]) {
  const [w, h] = PAGE_INCHES[pageSize];
  return { width: (w - 2 * MARGIN_IN) * PX_PER_IN, height: (h - 2 * MARGIN_IN) * PX_PER_IN };
}

/** Estimated height in px of the whole chart for a candidate layout (single column). */
function contentHeight(chart: Chart, barsPerRow: number, font: number): number {
  let em = 4; // header
  for (const s of chart.sections) em += Math.ceil(s.bars.length / barsPerRow) * 2 + 0.75;
  return em * font;
}

function candidates(settings: NnsSettings): Array<[1 | 2, number, number]> {
  const base = settings.barsPerRow;
  const bars = [base, ...[6, 8].filter((b) => b > base)];
  const auto = settings.columns === "auto";
  const first: 1 | 2 = settings.columns === "2" ? 2 : 1;
  const last: 1 | 2 = auto || settings.columns === "2" ? 2 : 1;
  const out: Array<[1 | 2, number, number]> = [[first, base, BASE_FONT_SIZE]];
  if (auto) out.push([2, base, BASE_FONT_SIZE]);
  for (const b of bars.slice(1)) out.push([last, b, BASE_FONT_SIZE]);
  const floor = Math.min(settings.minFontSize, BASE_FONT_SIZE);
  const finalBars = bars[bars.length - 1];
  for (let f = BASE_FONT_SIZE - 1; f >= floor; f--) {
    out.push([last, base, f]);
    if (finalBars !== base) out.push([last, finalBars, f]);
  }
  return out;
}

/**
 * Pick a layout in escalation order: one column at the configured bars per row,
 * then two columns, then more bars per row, then smaller fonts down to the
 * configured floor, and finally flow onto additional pages.
 */
export function planLayout(chart: Chart, settings: NnsSettings): LayoutPlan {
  const { width, height } = usable(settings.pageSize);
  const list = candidates(settings);
  const evaluate = ([columns, barsPerRow, fontSize]: [1 | 2, number, number]) => {
    const colWidth = width / columns - LABEL_EM * fontSize;
    const widthOk = colWidth / barsPerRow >= MIN_BAR_EM * fontSize;
    const pages = Math.max(1, Math.ceil(contentHeight(chart, barsPerRow, fontSize) / (columns * height)));
    return { columns, barsPerRow, fontSize, pages, widthOk };
  };
  for (const c of list) {
    const r = evaluate(c);
    if (r.widthOk && r.pages === 1) return { columns: r.columns, barsPerRow: r.barsPerRow, fontSize: r.fontSize, pages: 1 };
  }
  const fallback = evaluate(list[list.length - 1]);
  return { columns: fallback.columns, barsPerRow: fallback.barsPerRow, fontSize: fallback.fontSize, pages: fallback.pages };
}
