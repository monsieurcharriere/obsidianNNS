export type PageSize = "Letter" | "A4";
export type ColumnsSetting = "auto" | "1" | "2";

export interface NnsSettings {
  pageSize: PageSize;
  barsPerRow: number;
  columns: ColumnsSetting;
  minFontSize: number;
  showLetterChords: boolean;
}

export const DEFAULT_SETTINGS: NnsSettings = {
  pageSize: "Letter",
  barsPerRow: 4,
  columns: "auto",
  minFontSize: 11,
  showLetterChords: false,
};
