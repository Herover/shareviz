// SPDX-License-Identifier: MPL-2.0

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
// Informs the editor that the viewer has loaded and is ready to display chart data
export interface ViewerReady {
  type: "READY";
}

export type ViewerMessage = ViewerChartUpdated | ViewerChartEdit | ViewerReady;
