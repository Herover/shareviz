// SPDX-License-Identifier: MPL-2.0

import type { RichText } from "$lib/chart";
import type { ChartStore } from "$lib/chartStores/chart.svelte";
import ChartTextEditor from "./ChartTextEditor.svelte";

export interface ChartText {
  text: RichText;
}

const key = "text";
const chart = {
  name: "Text",
  key,
  add: (chart: ChartStore, index: number) =>
    chart.addElementData(index, key, {
      text: {
        ops: [{ insert: "Once uppon a time..." }, { insert: "\n", attributes: { block: "p" } }],
      },
    } as ChartText),
  component: () => import("./ChartTextComponent.svelte").then((mod) => mod.default),
  editorComponent: ChartTextEditor,
};

export default chart;
