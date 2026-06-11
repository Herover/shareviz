<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { EditorComponentProps } from "../chartComponents";
  import ChartText from "./ChartTextComponent.svelte";
  import RichTextField from "./RichTextField.svelte";

  let { spec, connection, id }: EditorComponentProps<ChartText> = $props();
</script>

<RichTextField
  {connection}
  path={["chart", "elements", spec.chart.elements.findIndex((e) => e.id == id), "d", "text"]}
  defaultBlock="p"
/>
