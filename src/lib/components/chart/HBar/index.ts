// SPDX-License-Identifier: MPL-2.0

import type { ChartStore } from "$lib/chartStores/chart.svelte";
import HBarEditor from "./HBarEditor.svelte";

export default {
  name: "Horizontal bars",
  key: "hBar",
  add: (chart: ChartStore, index: number) => chart.addBarChart(index),
  component: () => import("./Holder.svelte").then((mod) => mod.default),
  editorComponent: HBarEditor,
};
