// SPDX-License-Identifier: MPL-2.0

import type { Axis, LineRepeatSettings, LineSymbol } from "$lib/chart";
import { AxisLocation, AxisOrientation, AxisRepeatMode } from "$lib/chart";
import type { ChartStore } from "$lib/chartStores/chart.svelte";
import RangeEditor from "./RangeEditor.svelte";

export interface categoryKeys {
  k: string;
  label: {
    text: string;
  };
}

export interface rangeCategoryKeys {
  k: string;
  color: string;
  symbol: LineSymbol;
  label: {
    text: string;
  };
}

export interface RangeElement {
  axis: Axis;
  dataSet: string;
  // A chart for each
  repeat: string;
  repeatColumns: number;
  repeatSettings: LineRepeatSettings;
  // A range line for each
  categories: string;
  // How to sort categories
  categoryKeys: categoryKeys[];
  // Point value
  pointValue: string;
  // Point label
  pointLabel: string;
  // How to sort range categories
  rangeCategoryKeys: rangeCategoryKeys[];
}

const defaultData: RangeElement = {
  axis: {
    labelSpace: 20,
    location: AxisLocation.START,
    major: {
      grid: false,
      enabled: true,
      tickSize: 8,
      tickWidth: 1,
      color: "#aaaaaa",
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
      enabled: true,
      tickSize: 4,
      tickWidth: 1,
      color: "#aaaaaa",
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
    orientation: AxisOrientation.HORIZONTAL,
    repeat: AxisRepeatMode.FIRST,
  },
  dataSet: "",
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
  categories: "",
  pointLabel: "",
  pointValue: "",
  categoryKeys: [],
  rangeCategoryKeys: [],
};

const key = "range";
const chart = {
  name: "Range",
  key,
  add: (chart: ChartStore, index: number) => chart.addElementData(index, key, defaultData),
  component: () => import("./Holder.svelte").then((mod) => mod.default),
  editorComponent: RangeEditor,
};

export default chart;
