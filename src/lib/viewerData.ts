import type { Root } from "./chart";

export interface EditorChartData {
  type: "CHART_DATA";
  data: {
    chart: Root;
  };
}
export interface EditorChartScreenshot {
  type: "CHART_SCREENSHOT";
  data: {
    format: "png";
    zoom: number;
    name?: string;
  };
}
export type EditorMessage = EditorChartData | EditorChartScreenshot;

export interface ViewerChartUpdated {
  type: "CHART_UPDATED";
  data: {
    height: number;
  };
}
export interface ViewerChartEdit {
  type: "CHART_EDIT";
  data: {
    edit: { k: string; v: any };
  };
}

export type ViewerMessage = ViewerChartUpdated | ViewerChartEdit;
