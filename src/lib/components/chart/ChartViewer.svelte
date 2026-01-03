<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { Root } from "$lib/chart";
  import { getComponent } from "$lib/components/chart/chartComponents";
  import type { ComputedData } from "$lib/data";
  import { orNumber } from "$lib/utils";

  /* eslint-disable svelte/no-navigation-without-resolve */

  interface Props {
    chartSpec: Root;
    data: ComputedData;
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

  const editText = (target: string, e: Event & { currentTarget: EventTarget & HTMLElement }) => {
    const k = target,
      v = e.currentTarget.innerText;
    onedit({
      k,
      v,
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

  let css = $state(`
    .chart {
      padding-left: var(--chart-padding-left);
      padding-right: var(--chart-padding-right);
      padding-top: var(--chart-padding-top);
      padding-bottom: var(--chart-padding-bottom);
      background-color: var(--background-color);
      color: var(--text-primary-color);
      fill: var(--text-primary-color);




      /* Default light theme */
      --background-color: #ffffff;
      --text-primary-color: #000000;
      --text-mute-color: #888888;
      --chart-padding-left: 16px;
      --chart-padding-right: 16px;
      --chart-padding-top: 16px;
      --chart-padding-bottom: 16px;

      --axis-line-color: #aaaaaa;
      --axis-text-size: 0.9em;
    }

    .source-block {
      color: var(--text-mute-color);
    }

    .chart {
    }
    .chart[data-theme='dark'] {
      --background-color: #000000;
      --text-primary-color: #ffffff;
      --text-mute-color: #888888;
      --axis-line-color: #666666;
    }
  `);
</script>

<div>
  <style bind:innerHTML={css} contenteditable=""></style>
  <div class="chart" style:width="{chartWidth}px">
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
          onblur={(e) => editText("title", e)}
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
          onblur={(e) => editText("subTitle", e)}
          role="textbox"
          tabindex="0"
        ></span>
      {:else}
        {chartSpec.chart.subTitle}
      {/if}
    </p>
    {#each chartSpec.chart.elements as element, i (element.id)}
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
            onblur={(e) => editText("sourceLeft", e)}
            class="source-block"
          >
          </a>
        {:else}
          <!-- svelte/no-navigation-without-resolve -->
          <a
            href={editor ? null : chartSpec.chart.sourceTextLeftLink}
            class="source-block"
            onblur={(e) => editText("sourceLeft", e)}>{chartSpec.chart.sourceTextLeft}</a
          >
        {/if}
      </p>
      <p class="source-right" dir="auto">
        {#if editor}
          <!-- Disabled as it's not applicaple when innerText is set by svelte -->
          <!-- svelte-ignore a11y_consider_explicit_label -->
          <!-- svelte/no-navigation-without-resolve -->
          <a
            href={editor ? null : chartSpec.chart.sourceTextRightLink}
            bind:innerText={chartSpec.chart.sourceTextRight}
            contenteditable="true"
            spellcheck="false"
            onblur={(e) => editText("sourceRight", e)}
            class="source-block"
          >
          </a>
        {:else}
          <!-- svelte/no-navigation-without-resolve -->
          <a
            href={editor ? null : chartSpec.chart.sourceTextRightLink}
            class="source-block"
            onblur={(e) => editText("sourceRight", e)}>{chartSpec.chart.sourceTextRight}</a
          >
        {/if}
      </p>
    </div>
  </div>
</div>

<style>
  @font-face {
    font-family: "Open Sans";
    src: url("/fonts/Open_Sans/OpenSans-VariableFont_wdth,wght.ttf") format("truetype");
  }
  .chart {
    font-family: "Open Sans";
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
