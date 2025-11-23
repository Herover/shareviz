// SPDX-License-Identifier: MPL-2.0

import type { LineRepeatSettings, LineSymbol } from "$lib/chart";
import type { ChartStore } from "$lib/chartStores/chart.svelte";
import { registerComponent } from "../chartComponents";
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
    }
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
