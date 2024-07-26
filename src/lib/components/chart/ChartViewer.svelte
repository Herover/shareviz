<script lang="ts">
  import type { Root } from "$lib/chart";
  import { getComponent } from "$lib/components/chart/chartComponents";
  import { orNumber } from "$lib/utils";
  import { createEventDispatcher } from "svelte";

  export let chartSpec: Root;
  export let data: { [key: string]: any[] };
  export let width: number | undefined = undefined;
  export let editor: boolean;

  const dispatch = createEventDispatcher<{
    edit: {
      k: string;
      v: any;
    };
  }>();

  const editText = (
    target: string,
    e: KeyboardEvent & { currentTarget: EventTarget & HTMLElement },
  ) => {
    dispatch("edit", {
      k: target,
      v: e.currentTarget.innerText,
    });
  };

  const editElement = (i: number, d: any) => {
    const type = chartSpec.chart.elements[i].type;
    dispatch("edit", { k: type, v: [i, ...d] });
  };

  $: chartWidth = orNumber(width, chartSpec.chart.width);
</script>

<div
  class="chart"
  style:width="{chartWidth}px"
  style:background-color={chartSpec.style.bgColor}
  style:padding-left="{chartSpec.style.marginLeft}px"
  style:padding-right="{chartSpec.style.marginRight}px"
  style:padding-top="{chartSpec.style.marginTop}px"
  style:padding-bottom="{chartSpec.style.marginBottom}px"
  style:color={chartSpec.style.textColor}
  style:fill={chartSpec.style.textColor}
>
  <p
    style:font-size="{chartSpec.style.titleSize}em"
    style:font-weight={chartSpec.style.titleBold ? "bold" : "normal"}
    class="title"
  >
    {#if editor}
      <span
        bind:innerText={chartSpec.chart.title}
        contenteditable="true"
        on:keyup={(e) => editText("title", e)}
        role="textbox"
        tabindex="0"
      ></span>
    {:else}
      {chartSpec.chart.title}
    {/if}
  </p>
  <p
    style:font-size="{chartSpec.style.subTitleSize}em"
    style:font-weight={chartSpec.style.subTitleBold ? "bold" : "normal"}
  >
    {#if editor}
      <span
        bind:innerText={chartSpec.chart.subTitle}
        contenteditable="true"
        on:keyup={(e) => editText("subTitle", e)}
        role="textbox"
        tabindex="0"
      ></span>
    {:else}
      {chartSpec.chart.subTitle}
    {/if}
  </p>
  {#each chartSpec.chart.elements as element, i}
    <svelte:component
      this={getComponent(element.type)}
      componentSpec={element.d}
      {chartSpec}
      {data}
      {chartWidth}
      {editor}
      on:edit={(e) => editElement(i, e.detail)}
    />
  {/each}
  <div class="source">
    <p class="source-left">
      {#if editor}
        <a
          href={editor ? null : chartSpec.chart.sourceTextLeftLink}
          bind:innerText={chartSpec.chart.sourceTextLeft}
          contenteditable="true"
          on:keyup={(e) => editText("sourceLeft", e)}
          style="color:#888888"
        >
        </a>
      {:else}
        <a
          href={editor ? null : chartSpec.chart.sourceTextLeftLink}
          style="color:#888888"
          on:keyup={(e) => editText("sourceLeft", e)}
          >{chartSpec.chart.sourceTextLeft}</a
        >
      {/if}
    </p>
    <p class="source-right">
      {#if editor}
        <a
          href={editor ? null : chartSpec.chart.sourceTextRightLink}
          bind:innerText={chartSpec.chart.sourceTextRight}
          contenteditable="true"
          on:keyup={(e) => editText("sourceRight", e)}
          style="color:#888888"
        >
        </a>
      {:else}
        <a
          href={editor ? null : chartSpec.chart.sourceTextRightLink}
          style="color:#888888"
          on:keyup={(e) => editText("sourceRight", e)}
          >{chartSpec.chart.sourceTextRight}</a
        >
      {/if}
    </p>
  </div>
</div>

<style>
  .chart {
    font-family: Arial, Helvetica, sans-serif;
    box-sizing: border-box;
  }
  .source {
    display: flex;
    gap: 16px;
  }
  .source p {
    margin-bottom: 0px;
  }
  .source-right {
    margin-left: auto;
  }
  p.title {
    margin-top: 0px;
  }
</style>
