import { registerComponent } from "../chartComponents";
import Holder from "./Holder.svelte";
import HBarEditor from "./HBarEditor.svelte";

export default {
  name: "Horizontal bars",
  key: "hBar",
  component: Holder,
  editorComponent: HBarEditor,
};
