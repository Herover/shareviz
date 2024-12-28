import type { db } from "$lib/chartStore";
import HBarEditor from "./HBarEditor.svelte";

export default {
  name: "Horizontal bars",
  key: "hBar",
  add: (chart: ReturnType<typeof db.chart>, index: number) => chart.addBarChart(index),
  component: () => import("./Holder.svelte").then((mod) => mod.default),
  editorComponent: HBarEditor,
};
