// SPDX-License-Identifier: MPL-2.0

import type { ChartStore } from "$lib/chartStores/chart.svelte";
import LineEditor from "./LineEditor.svelte";

export default {
  name: "Line",
  key: "line",
  add: (chart: ChartStore, index: number) => chart.addLineChart(index),
  component: () => import("./Holder.svelte").then((mod) => mod.default),
  editorComponent: LineEditor,
};
