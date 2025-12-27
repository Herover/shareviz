<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { LabelLocation, LabelStyleLine, type Color } from "$lib/chart";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";
  import { formatData } from "./data";
  import type { LineStyleStore } from "$lib/chartStores/lineStyle.svelte";
  import type { LineStore } from "$lib/chartStores/line.svelte";

  interface Props {
    style: LineStyleStore;
    unspecifiecKeys?: null | string[];
    chartColors: string[];
    values: ReturnType<typeof formatData>;
    line: LineStore;
  }

  let {
    unspecifiecKeys = null,
    chartColors,
    values,
    style,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    line,
  }: Props = $props();

  type Value = (typeof values)[number];
  let flatValues = $derived(
    values.reduce(
      (acc, d) => {
        acc = [...acc, ...d.d];
        return acc;
      },
      [] as Value["d"],
    ),
  );

  let type = $derived(typeof flatValues[0]?.value[0]?.x == "number" ? "number" : "date");
  let updateColor = $derived((color: Color) => {
    if (style.data.label.color == style.data.color) {
      style.setLabelColor(color);
    }
    style.setColor(color);
  });
  let updateLabelColor = $derived((color: Color) => {
    style.setLabelColor(color);
  });
  let setLabelX = $derived((value: string) => {
    const parsed = type == "number" ? Number.parseInt(value) : new Date(value).getTime();
    const proposed = flatValues
      .find((e) => e.key == style.data.k)
      ?.value.map((d) => ({ d: Math.abs(parsed - d.x), x: d.x, y: d.y }))
      .sort((a, b) => a.d - b.d)[0] || { x: 0, y: 0 };
    const proposedY = flatValues
      .find((e) => e.key == style.data.k)
      ?.value.find((d) => d.x == proposed.x);
    if (typeof proposedY != "undefined") {
      style.setLabelY(proposed.y);
    }
    style.setLabelX(proposed.x instanceof Date ? proposed.x.getTime() : proposed.x);
  });
</script>

<div class="line-style-editor">
  {#if unspecifiecKeys != null}
    <select value={style.data.k} onchange={(e) => style.setKey(e.currentTarget.value)}>
      <option>{style.data.k}</option>
      {#each unspecifiecKeys as k (k)}
        <option>{k}</option>
      {/each}
    </select>
  {/if}

  <input
    value={style.data.label.text}
    onchange={(e) => style.setLabelText(e.currentTarget.value)}
    onkeyup={(e) => style.setLabelText(e.currentTarget.value)}
  />

  <select
    value={style.data.label.location}
    onchange={(e) => style.setLabelLocation(e.currentTarget.value)}
  >
    {#each Object.values(LabelLocation) as orientation (orientation)}
      <option>{orientation}</option>
    {/each}
  </select>

  {#if unspecifiecKeys != null && style.data.label.location == LabelLocation.Float}
    <input
      value={type == "number"
        ? style.data.label.x
        : new Date(style.data.label.x).toISOString().split("T")[0]}
      onchange={(e) => setLabelX(e.currentTarget.value)}
      onkeyup={(e) => setLabelX(e.currentTarget.value)}
      {type}
      style="width: 104px;"
    />
    <input
      checked={style.data.label.line == LabelStyleLine.Line}
      onchange={(e) =>
        style.setLabelLine(e.currentTarget.checked ? LabelStyleLine.Line : LabelStyleLine.None)}
      type="checkbox"
    />
  {/if}

  <ColorPicker color={style.data.color.light.v} {chartColors} onchange={(s) => updateColor(s)} />

  <ColorPicker
    color={style.data.label.color.light.v}
    {chartColors}
    onchange={(s) => updateLabelColor(s)}
  />

  <input
    value={style.data.width}
    onchange={(e) => style.setwidth(Number.parseInt(e.currentTarget.value))}
    onkeyup={(e) => style.setwidth(Number.parseInt(e.currentTarget.value))}
    type="number"
    style="width: 80px;"
  />

  {#if unspecifiecKeys != null}
    <button onclick={() => style.delete()}>Delete</button>
  {/if}
</div>

<style>
  .line-style-editor {
    display: block;
  }
</style>
