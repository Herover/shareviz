// SPDX-License-Identifier: MPL-2.0

import type { HBar } from "$lib/chart";
import { AxisLocation, AxisOrientation, AxisRepeatMode, HBarTotalLabelStyle } from "$lib/chart";
import type { ChartStore } from "$lib/chartStores/chart.svelte";
import HBarEditor from "./HBarEditor.svelte";

const defaultData: HBar = {
  dataSet: "",
  categories: "",
  subCategories: "",
  stackSubCategories: true,
  portionSubCategories: false,
  value: "",
  labelWidth: 170,
  repeat: "",
  colors: {
    default: { light: { c: "#888888", v: "#888888" } },
    byKey: [],
  },
  rectLabels: false,
  totalLabels: HBarTotalLabelStyle.NONE,
  axis: {
    location: AxisLocation.START,
    labelSpace: 0,
    orientation: AxisOrientation.HORIZONTAL,
    repeat: AxisRepeatMode.FIRST,
    major: {
      grid: true,
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
};

const key = "hBar";
const chart = {
  name: "Horizontal bars",
  key,
  add: (chart: ChartStore, index: number) => chart.addElementData(index, key, defaultData),
  component: () => import("./Holder.svelte").then((mod) => mod.default),
  editorComponent: HBarEditor,
};

export default chart;
