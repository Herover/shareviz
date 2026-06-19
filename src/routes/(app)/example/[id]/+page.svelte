<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { db } from "$lib/chartStore";
  import { getSampleChart } from "$lib/sampleCharts";
  import type { Root } from "$lib/chart";

  let errorMsg: string | null = $state(null);

  onMount(() => {
    const sample = getSampleChart(page.params.id);
    if (!sample) {
      errorMsg = "Unknown example chart.";
      return;
    }

    (async () => {
      try {
        const chart: Root = await fetch(sample.url).then((r) => r.json());
        const docId = db.createLocalFrom(chart);
        // replaceState so this copy URL isn't left in history (back shouldn't re-copy).
        goto(resolve("/(app)/editor/chart/[id]", { id: docId }), { replaceState: true });
      } catch {
        errorMsg = "Could not open this example.";
      }
    })();
  });
</script>

<div class="creating">{errorMsg ?? "Creating your copy…"}</div>

<style>
  .creating {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: var(--font-display);
    font-size: 1.25rem;
    color: var(--fg-secondary);
  }
</style>
