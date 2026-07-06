// SPDX-License-Identifier: MPL-2.0

import type { Axis, LineRepeatSettings, ResponsiveColor } from "$lib/chart";
import { AxisLocation, AxisOrientation, AxisRepeatMode } from "$lib/chart";
import type { ChartStore } from "$lib/chartStores/chart.svelte";
import type { Annotation } from "../Annotations/annotations";
import ScatterEditor from "./ScatterEditor.svelte";

export interface scatterCategoryKeys {
  k: string;
  color: ResponsiveColor;
  label: {
    text: string;
  };
}

// Maps to d3-shape curve functions in Holder.svelte
export enum ScatterCurve {
  LINEAR = "linear",
  CARDINAL = "cardinal",
  BUMP_X = "bumpX",
  BUMP_Y = "bumpY",
}

export enum ScatterLabelMode {
  NONE = "none",
  FIRST = "first",
  LAST = "last",
  END_POINTS = "end_points",
  ALL = "all",
}

export enum ScatterXAxisLabelLocation {
  ABOVE = "above",
  BELOW = "below",
}

export enum ScatterYAxisLabelLocation {
  ROTATED_LEFT = "rotatedLeft",
  ROTATED_RIGHT = "rotatedRight",
  ABOVE_LEFT = "aboveLeft",
  ABOVE_RIGHT = "aboveRight",
  BELOW_LEFT = "belowLeft",
  BELOW_RIGHT = "belowRight",
}

export interface ScatterElement {
  dataSet: string;
  // Values for the horizontal axis
  x: {
    axis: Axis;
    key: string;
    // Axis label, hidden when text is empty
    label: {
      text: string;
      location: ScatterXAxisLabelLocation;
    };
  };
  // Values for the vertical axis
  y: {
    axis: Axis;
    key: string;
    // Axis label, hidden when text is empty
    label: {
      text: string;
      location: ScatterYAxisLabelLocation;
    };
  };
  // Column that groups points into colored series, empty for a single series
  categories: string;
  // How to sort and color series
  categoryKeys: scatterCategoryKeys[];
  // Column with per-point labels, shown when hovering points
  pointLabel: string;
  // Which points get a text label with the pointLabel value
  labelMode: ScatterLabelMode;
  // Connect points within a series with a line, in data order
  connect: boolean;
  // Shape of the connecting line
  curve: ScatterCurve;
  // Column that scales point radius, empty for fixed radius
  radiusValue: string;
  // Point radius, or radius of the largest value when radiusValue is set
  radius: number;
  // Point fill opacity, 0-1
  opacity: number;
  // Chart height relative to width
  heightRatio: number;
  // Text notes and zone boxes drawn over the plot
  annotations: Annotation[];
  // Small multiples: a chart for every value in this column, empty for a single chart
  repeat: string;
  repeatColumns: number;
  repeatSettings: LineRepeatSettings;
}

const defaultData: ScatterElement = {
  dataSet: "",
  x: {
    key: "",
    label: {
      text: "",
      location: ScatterXAxisLabelLocation.BELOW,
    },
    axis: {
      location: AxisLocation.END,
      labelSpace: 8,
      orientation: AxisOrientation.HORIZONTAL,
      repeat: AxisRepeatMode.FIRST,
      major: {
        grid: false,
        enabled: true,
        tickSize: 8,
        tickWidth: 1,
        labelDivide: 1,
        labelThousands: "",
        afterLabel: "",
        auto: {
          from: "",
          each: 10,
          labels: true,
        },
        ticks: [],
      },
      minor: {
        grid: false,
        enabled: false,
        tickSize: 4,
        tickWidth: 1,
        labelDivide: 1,
        labelThousands: "",
        afterLabel: "",
        auto: {
          from: "",
          each: 1,
          labels: false,
        },
        ticks: [],
      },
    },
  },
  y: {
    key: "",
    label: {
      text: "",
      location: ScatterYAxisLabelLocation.ABOVE_LEFT,
    },
    axis: {
      location: AxisLocation.END,
      labelSpace: 8,
      orientation: AxisOrientation.VERTICAL,
      repeat: AxisRepeatMode.FIRST,
      major: {
        grid: true,
        enabled: true,
        tickSize: 8,
        tickWidth: 1,
        labelDivide: 1,
        labelThousands: ",",
        afterLabel: "",
        auto: {
          from: "",
          each: 10,
          labels: true,
        },
        ticks: [],
      },
      minor: {
        grid: false,
        enabled: false,
        tickSize: 8,
        tickWidth: 1,
        labelDivide: 1,
        labelThousands: "",
        afterLabel: "",
        auto: {
          from: "",
          each: 1,
          labels: false,
        },
        ticks: [],
      },
    },
  },
  categories: "",
  categoryKeys: [],
  pointLabel: "",
  labelMode: ScatterLabelMode.NONE,
  connect: false,
  curve: ScatterCurve.LINEAR,
  radiusValue: "",
  radius: 5,
  opacity: 0.8,
  heightRatio: 0.75,
  annotations: [],
  repeat: "",
  repeatColumns: 2,
  repeatSettings: {
    byKey: [],
    default: {
      allCharts: false,
      k: "",
      ownChart: true,
      title: "",
    },
  },
};

const key = "scatter";
const chart = {
  name: "Scatter",
  key,
  add: (chart: ChartStore, index: number) => chart.addElementData(index, key, defaultData),
  component: () => import("./Holder.svelte").then((mod) => mod.default),
  editorComponent: ScatterEditor,
};

export default chart;
