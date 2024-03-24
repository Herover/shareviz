<script lang="ts">
  import { db } from "$lib/chartStore";

  export let chartScope: ReturnType<typeof db.chart>;
  export let chart: any;
</script>

<p>
  Title: <input
    value={chart.title}
    on:keyup={(e) => chartScope.setConfigTitle(e.currentTarget.value)}
  />
</p>
<p>
  Sub title: <input
    value={chart.subTitle}
    on:keyup={(e) => chartScope.setConfigSubTitle(e.currentTarget.value)}
  />
</p>
<p>
  Source text (left): <input
    value={chart.sourceTextLeft}
    on:keyup={(e) => chartScope.setSourceTextLeft(e.currentTarget.value)}
  />
</p>
<p>
  Source link (left): <input
    value={chart.sourceTextLeftLink}
    on:keyup={(e) => chartScope.setSourceTextLeftLink(e.currentTarget.value)}
  />
</p>
<p>
  Source text (right): <input
    value={chart.sourceTextRight}
    on:keyup={(e) => chartScope.setSourceTextRight(e.currentTarget.value)}
  />
</p>
<p>
  Source link (right): <input
    value={chart.sourceTextRightLink}
    on:keyup={(e) => chartScope.setSourceTextLeftRight(e.currentTarget.value)}
  />
</p>
<p>
  Height: <input
    value={chart.height}
    on:keyup={(e) => chartScope.setConfigHeight(Number.parseInt(e.currentTarget.value))}
    on:change={(e) => chartScope.setConfigHeight(Number.parseInt(e.currentTarget.value))}
    type="number"
  />
</p>
<p>
  Width: <input
    value={chart.width}
    on:keyup={(e) => chartScope.setConfigWidth(Number.parseInt(e.currentTarget.value))}
    on:change={(e) => chartScope.setConfigWidth(Number.parseInt(e.currentTarget.value))}
    type="number"
  />
</p>

<style>
  input {
    width: 100%;
    box-sizing: border-box;
  }
  /* p {
    margin-top: 1em;
  } */
</style>