import { Notice, Platform, type App, type TFile } from "obsidian";
import { splitFrontmatter, isNnsFrontmatter, extractChartBlocks } from "../parser";
import { renderChordText } from "../render";
import type { NnsSettings } from "../settings";
import css from "../../styles.css";
import { PrintModal } from "./printView";

/** Returns the ChordText sources contained in a note (whole body or fenced blocks). */
export function chartsInNote(text: string): string[] {
  const { frontmatter, body } = splitFrontmatter(text);
  if (isNnsFrontmatter(frontmatter)) return [body];
  return extractChartBlocks(body);
}

export function buildDocument(sources: string[], settings: NnsSettings): string {
  const pages = sources.map((s) => renderChordText(s, settings).html).join("\n");
  const pageCss = `@page { size: ${settings.pageSize}; margin: 0.5in; } body { background:#fff; margin:0; font-family: sans-serif; }`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}\n${pageCss}</style></head><body>${pages}</body></html>`;
}

interface ElectronRemote {
  BrowserWindow: new (opts: object) => {
    loadURL(url: string): Promise<void>;
    webContents: { printToPDF(opts: object): Promise<Uint8Array> };
    destroy(): void;
  };
}

function getRemote(): ElectronRemote | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const electron = require("electron") as { remote?: ElectronRemote };
    return electron.remote?.BrowserWindow ? electron.remote : null;
  } catch {
    return null;
  }
}

export async function exportNoteToPdf(app: App, file: TFile, settings: NnsSettings): Promise<void> {
  const text = await app.vault.cachedRead(file);
  const sources = chartsInNote(text);
  if (sources.length === 0) {
    new Notice("No NNS chart found in this note.");
    return;
  }
  const doc = buildDocument(sources, settings);
  const remote = Platform.isDesktopApp ? getRemote() : null;
  if (!remote) {
    new Notice("PDF export is not available here. Opening a print-friendly view instead.");
    new PrintModal(app, doc).open();
    return;
  }
  const win = new remote.BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  try {
    await win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(doc));
    const data = await win.webContents.printToPDF({
      pageSize: settings.pageSize,
      printBackground: true,
      preferCSSPageSize: true,
    });
    const folder = file.parent && file.parent.path !== "/" ? file.parent.path + "/" : "";
    const path = `${folder}${file.basename}.pdf`;
    const bytes = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    await app.vault.adapter.writeBinary(path, bytes);
    new Notice(`Exported ${path}`);
  } catch (e) {
    console.error(e);
    new Notice("PDF export failed. Opening a print-friendly view instead.");
    new PrintModal(app, doc).open();
  } finally {
    win.destroy();
  }
}
