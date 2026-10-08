import { Notice, Plugin, TFile, type MarkdownPostProcessorContext } from "obsidian";
import { exportNoteToPdf } from "./export";
import { splitFrontmatter, isNnsFrontmatter, parseChordText } from "./parser";
import { renderChartHtml } from "./render/html";
import { BASE_FONT_SIZE } from "./layout";
import { DEFAULT_SETTINGS, type NnsSettings } from "./settings";
import { NnsSettingTab } from "./settingsTab";

const MENU_TITLE = "Export as NNS chart PDF";

export default class NnsPlugin extends Plugin {
  settings: NnsSettings = { ...DEFAULT_SETTINGS };

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new NnsSettingTab(this.app, this));

    const processor = (source: string, el: HTMLElement) => this.renderInline(source, el);
    this.registerMarkdownCodeBlockProcessor("chordtext", processor);
    this.registerMarkdownCodeBlockProcessor("nns", processor);
    this.registerMarkdownPostProcessor((el, ctx) => this.renderWholeNote(el, ctx));

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof TFile && file.extension === "md") {
          menu.addItem((item) =>
            item.setTitle(MENU_TITLE).setIcon("file-down").onClick(() => exportNoteToPdf(this.app, file, this.settings))
          );
        }
      })
    );
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, _editor, view) => {
        const file = view.file;
        if (file) {
          menu.addItem((item) =>
            item.setTitle(MENU_TITLE).setIcon("file-down").onClick(() => exportNoteToPdf(this.app, file, this.settings))
          );
        }
      })
    );
    this.addCommand({
      id: "export-nns-chart-pdf",
      name: MENU_TITLE,
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) void exportNoteToPdf(this.app, file, this.settings);
        return true;
      },
    });
  }

  private renderInline(source: string, el: HTMLElement): void {
    try {
      const chart = parseChordText(source);
      const html = renderChartHtml(chart, {
        barsPerRow: this.settings.barsPerRow,
        columns: 1,
        fontSize: BASE_FONT_SIZE,
        showLetters: this.settings.showLetterChords,
      });
      el.append(...Array.from(new DOMParser().parseFromString(html, "text/html").body.childNodes));
    } catch (e) {
      console.error(e);
      new Notice("NNS chart failed to render.");
      el.setText("NNS chart failed to render.");
    }
  }

  /** Render notes with `nns: true` frontmatter as a single chart. */
  private async renderWholeNote(el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<void> {
    const info = ctx.getSectionInfo(el);
    if (!info) return;
    const { frontmatter, body, bodyOffset } = splitFrontmatter(info.text);
    if (!isNnsFrontmatter(frontmatter)) return;
    const lines = info.text.split("\n");
    let first = bodyOffset;
    while (first < lines.length && lines[first].trim() === "") first++;
    el.empty();
    if (info.lineStart === first) this.renderInline(body, el);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
