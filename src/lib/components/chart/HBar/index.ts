import HBarEditor from "./HBarEditor.svelte";

export default {
  name: "Horizontal bars",
  key: "hBar",
  component: () => import("./Holder.svelte").then((mod) => mod.default),
  editorComponent: HBarEditor,
};
