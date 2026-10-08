import { PluginSettingTab, Setting, type App } from "obsidian";
import type NnsPlugin from "./main";
import type { ColumnsSetting, PageSize } from "./settings";

export class NnsSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: NnsPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    const s = this.plugin.settings;
    const save = () => this.plugin.saveSettings();

    new Setting(containerEl).setName("Page size").addDropdown((d) =>
      d.addOptions({ Letter: "Letter", A4: "A4" }).setValue(s.pageSize).onChange(async (v) => {
        s.pageSize = v as PageSize;
        await save();
      })
    );
    new Setting(containerEl).setName("Bars per row").addSlider((sl) =>
      sl.setLimits(1, 8, 1).setValue(s.barsPerRow).setDynamicTooltip().onChange(async (v) => {
        s.barsPerRow = v;
        await save();
      })
    );
    new Setting(containerEl).setName("Columns").addDropdown((d) =>
      d.addOptions({ auto: "Auto", "1": "1", "2": "2" }).setValue(s.columns).onChange(async (v) => {
        s.columns = v as ColumnsSetting;
        await save();
      })
    );
    new Setting(containerEl).setName("Minimum font size (px)").setDesc("Between 6 and 40.").addText((t) =>
      t.setValue(String(s.minFontSize)).onChange(async (v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n >= 6 && n <= 40) {
          s.minFontSize = n;
          await save();
        }
      })
    );
    new Setting(containerEl)
      .setName("Show letter chords")
      .setDesc("Show letter names under each number, derived from the chart's Key.")
      .addToggle((t) =>
        t.setValue(s.showLetterChords).onChange(async (v) => {
          s.showLetterChords = v;
          await save();
        })
      );
  }
}
