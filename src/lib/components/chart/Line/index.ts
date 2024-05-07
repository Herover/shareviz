import Holder from "./Holder.svelte";
import { registerComponent } from "../chartComponents";
import Line from "./Line.svelte";
import LineEditor from "./LineEditor.svelte";

export default {
  name: "Line",
  key: "line",
  component: Holder,
  editorComponent: LineEditor,
};
