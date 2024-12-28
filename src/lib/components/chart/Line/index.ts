import type { db } from "$lib/chartStore";
import LineEditor from "./LineEditor.svelte";

export default {
  name: "Line",
  key: "line",
  add: (chart: ReturnType<typeof db.chart>, index: number) => chart.addLineChart(index),
  component: () => import("./Holder.svelte").then((mod) => mod.default),
  editorComponent: LineEditor,
};
