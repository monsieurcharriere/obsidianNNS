import { parseChordText } from "../parser";
import { planLayout } from "../layout/fit";
import type { NnsSettings } from "../settings";
import { renderChartHtml } from "./html";

/** Parse ChordText and render it with an automatically fitted layout. */
export function renderChordText(text: string, settings: NnsSettings): { html: string; pages: number } {
  const chart = parseChordText(text);
  const plan = planLayout(chart, settings);
  const html = renderChartHtml(chart, {
    barsPerRow: plan.barsPerRow,
    columns: plan.columns,
    fontSize: plan.fontSize,
    showLetters: settings.showLetterChords,
  });
  return { html, pages: plan.pages };
}
