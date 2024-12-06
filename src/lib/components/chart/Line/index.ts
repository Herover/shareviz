import LineEditor from "./LineEditor.svelte";

export default {
  name: "Line",
  key: "line",
  component: () => import("./Holder.svelte").then((mod) => mod.default),
  editorComponent: LineEditor,
};
