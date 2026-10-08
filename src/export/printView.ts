import { Modal, type App } from "obsidian";

/** Fallback: shows the chart in a modal with a Print button. */
export class PrintModal extends Modal {
  constructor(app: App, private readonly doc: string) {
    super(app);
  }

  onOpen(): void {
    this.modalEl.addClass("nns-print-modal");
    const actions = this.contentEl.createDiv({ cls: "nns-actions" });
    actions.createEl("button", { text: "Print" }).addEventListener("click", () => {
      const frame = this.contentEl.querySelector("iframe");
      frame?.contentWindow?.print();
    });
    const frame = this.contentEl.createEl("iframe");
    frame.setCssStyles({ width: "100%", height: "70vh", border: "0" });
    frame.srcdoc = this.doc;
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
