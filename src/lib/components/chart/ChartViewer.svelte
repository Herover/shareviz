<script lang="ts">
  import type { Root } from "$lib/chart";
  import { getComponent } from "$lib/components/chart/chartComponents";
  import { orNumber } from "$lib/utils";

  interface Props {
    chartSpec: Root;
    data: { [key: string]: any[] };
    width?: number | undefined;
    editor: boolean;
    onedit?: (d: { k: string; v: any }) => void;
  }

  let {
    chartSpec = $bindable(),
    data,
    width = undefined,
    editor,
    onedit = () => {},
  }: Props = $props();

  const editText = (
    target: string,
    e: KeyboardEvent & { currentTarget: EventTarget & HTMLElement },
  ) => {
    onedit({
      k: target,
      v: e.currentTarget.innerText,
    });
  };

  const editElement = (i: number, d: any) => {
    const type = chartSpec.chart.elements[i].type;
    onedit({ k: type, v: [i, ...d] });
  };

  let chartWidth = $derived(orNumber(width, chartSpec.chart.width));

  const mkEditElement = (i: number) => {
    return (e: CustomEvent<any>) => editElement(i, e.detail);
  };
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
  style:--axis-text-size={"0.9em"}
>
  <p
    style:font-size="{chartSpec.style.titleSize}em"
    style:font-weight={chartSpec.style.titleBold ? "bold" : "normal"}
    class="title"
    dir="auto"
  >
    {#if editor}
      <span
        bind:innerText={chartSpec.chart.title}
        contenteditable="true"
        spellcheck="false"
        onkeyup={(e) => editText("title", e)}
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
    dir="auto"
  >
    {#if editor}
      <span
        bind:innerText={chartSpec.chart.subTitle}
        contenteditable="true"
        spellcheck="false"
        onkeyup={(e) => editText("subTitle", e)}
        role="textbox"
        tabindex="0"
      ></span>
    {:else}
      {chartSpec.chart.subTitle}
    {/if}
  </p>
  {#each chartSpec.chart.elements as element, i (element.id)}
    <svelte:boundary>
      {#await getComponent(element.type) then component}
        {@const SvelteComponent = component}
        <SvelteComponent
          componentSpec={element.d}
          {chartSpec}
          {data}
          {chartWidth}
          {editor}
          index={i}
          on:edit={mkEditElement(i)}
        />
      {/await}

      {#snippet failed(error, reset)}
        <button onclick={reset}>A error happened in the {element.type} chart, click to reset</button
        >
        <pre>{error ? error : ""}</pre>
      {/snippet}
    </svelte:boundary>
  {/each}
  <div class="source">
    <p class="source-left" dir="auto">
      {#if editor}
        <!-- Disabled as it's not applicaple when innerText is set by svelte -->
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a
          href={editor ? null : chartSpec.chart.sourceTextLeftLink}
          bind:innerText={chartSpec.chart.sourceTextLeft}
          contenteditable="true"
          spellcheck="false"
          onkeyup={(e) => editText("sourceLeft", e)}
          style="color:#888888"
        >
        </a>
      {:else}
        <a
          href={editor ? null : chartSpec.chart.sourceTextLeftLink}
          style="color:#888888"
          onkeyup={(e) => editText("sourceLeft", e)}>{chartSpec.chart.sourceTextLeft}</a
        >
      {/if}
    </p>
    <p class="source-right" dir="auto">
      {#if editor}
        <!-- Disabled as it's not applicaple when innerText is set by svelte -->
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a
          href={editor ? null : chartSpec.chart.sourceTextRightLink}
          bind:innerText={chartSpec.chart.sourceTextRight}
          contenteditable="true"
          spellcheck="false"
          onkeyup={(e) => editText("sourceRight", e)}
          style="color:#888888"
        >
        </a>
      {:else}
        <a
          href={editor ? null : chartSpec.chart.sourceTextRightLink}
          style="color:#888888"
          onkeyup={(e) => editText("sourceRight", e)}>{chartSpec.chart.sourceTextRight}</a
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
    text-align: right;
  }
  .source-left {
    text-align: left;
  }
  p.title {
    margin-top: 0px;
  }
</style>
