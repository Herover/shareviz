<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { ChartComponentProps } from "../chartComponents";
  import type { ChartText } from "./ChartText";
  import DeltaView from "./DeltaView.svelte";

  let { componentSpec }: ChartComponentProps<ChartText> = $props();
</script>

<DeltaView delta={componentSpec.text} />
