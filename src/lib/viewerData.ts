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
export interface EditorChartHighlight {
  type: "CHART_HIGHLIGHT";
  data: {
    target: any[];
  };
}
export type EditorMessage = EditorChartData | EditorChartScreenshot | EditorChartHighlight;

export interface ViewerChartUpdated {
  type: "CHART_UPDATED";
  data: {
    height: number;
  };
  id: string;
}
export interface ViewerChartEdit {
  type: "CHART_EDIT";
  data: {
    edit: { k: string; v: any };
  };
  id: string;
}
// Informs the editor that the viewer has loaded and is ready to display chart data
export interface ViewerReady {
  type: "READY";
  id: string;
}

export type ViewerMessage = ViewerChartUpdated | ViewerChartEdit | ViewerReady;
