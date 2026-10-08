import { describe, expect, it } from "vitest";
import { parseChordText } from "../src/parser";
import { planLayout } from "../src/layout";
import { renderChartHtml } from "../src/render/html";
import { DEFAULT_SETTINGS } from "../src/settings";
import { amazingGrace, brokenChart } from "./fixtures/amazing-grace";

const opts = { barsPerRow: 4, columns: 1 as const, fontSize: 18, showLetters: false };

describe("html snapshots", () => {
  it("amazing grace", () => {
    expect(renderChartHtml(parseChordText(amazingGrace), opts)).toMatchSnapshot();
  });
  it("amazing grace with letters", () => {
    expect(renderChartHtml(parseChordText(amazingGrace), { ...opts, showLetters: true })).toMatchSnapshot();
  });
  it("broken chart shows inline errors", () => {
    const html = renderChartHtml(parseChordText(brokenChart), opts);
    expect(html).toContain("nns-error");
    expect(html).toMatchSnapshot();
  });
  it("renders extensions as superscripts", () => {
    expect(renderChartHtml(parseChordText("V:\n4maj7"), opts)).toContain('4<sup class="nns-ext">maj7</sup>');
  });
});

describe("planLayout", () => {
  const big = parseChordText("V:\n" + Array(400).fill("1 4 5 1").join("\n"));
  it("keeps defaults when chart fits", () => {
    expect(planLayout(parseChordText(amazingGrace), DEFAULT_SETTINGS)).toEqual({
      columns: 1, barsPerRow: 4, fontSize: 18, pages: 1,
    });
  });
  it("tries two columns first, then flows onto more pages at font floor", () => {
    const mid = parseChordText(Array.from({ length: 5 }, (_, i) => `S${i}:\n` + Array(14).fill(`${i + 1} 4 5 1`).join("\n")).join("\n"));
    expect(planLayout(mid, DEFAULT_SETTINGS).columns).toBe(2);
    const plan = planLayout(big, DEFAULT_SETTINGS);
    expect(plan.fontSize).toBe(DEFAULT_SETTINGS.minFontSize);
    expect(plan.pages).toBeGreaterThan(1);
  });
  it("honours a fixed column setting", () => {
    expect(planLayout(big, { ...DEFAULT_SETTINGS, columns: "1" }).columns).toBe(1);
  });
});
