<script lang="ts">
  import { LabelLocation, LabelStyleLine } from "$lib/chart";
  import { lineStyle } from "$lib/chartStore";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";
  import { formatData } from "./data";
  import { db } from "$lib/chartStore";

  interface Props {
    style: ReturnType<typeof lineStyle>;
    unspecifiecKeys?: null | string[];
    chartColors: string[];
    values: ReturnType<typeof formatData>;
    lineSpec: ReturnType<ReturnType<typeof db.chart>["line"]>;
  }

  let {
    style,
    unspecifiecKeys = null,
    chartColors,
    values,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    lineSpec,
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
  let updateColor = $derived((color: string) => {
    if ($style.label.color == $style.color) {
      style.setLabelColor(color);
    }
    style.setColor(color);
  });
  let updateLabelColor = $derived((color: string) => {
    style.setLabelColor(color);
  });
  let setLabelX = $derived((value: string) => {
    const parsed = type == "number" ? Number.parseInt(value) : new Date(value).getTime();
    const proposed = flatValues
      .find((e) => e.key == $style.k)
      ?.value.map((d) => ({ d: Math.abs(parsed - d.x), x: d.x, y: d.y }))
      .sort((a, b) => a.d - b.d)[0] || { x: 0, y: 0 };
    const proposedY = flatValues
      .find((e) => e.key == $style.k)
      ?.value.find((d) => d.x == proposed.x);
    if (typeof proposedY != "undefined") {
      style.setLabelY(proposed.y);
    }
    style.setLabelX(proposed.x instanceof Date ? proposed.x.getTime() : proposed.x);
  });
</script>

<div class="line-style-editor">
  {#if unspecifiecKeys != null}
    <select value={$style.k} onchange={(e) => style.setKey(e.currentTarget.value)}>
      <option>{$style.k}</option>
      {#each unspecifiecKeys as k}
        <option>{k}</option>
      {/each}
    </select>
  {/if}

  <input
    value={$style.label.text}
    onchange={(e) => style.setLabelText(e.currentTarget.value)}
    onkeyup={(e) => style.setLabelText(e.currentTarget.value)}
  />

  <select
    value={$style.label.location}
    onchange={(e) => style.setLabelLocation(e.currentTarget.value)}
  >
    {#each Object.values(LabelLocation) as orientation}
      <option>{orientation}</option>
    {/each}
  </select>

  {#if unspecifiecKeys != null && $style.label.location == LabelLocation.Float}
    <input
      value={type == "number"
        ? $style.label.x
        : new Date($style.label.x).toISOString().split("T")[0]}
      onchange={(e) => setLabelX(e.currentTarget.value)}
      onkeyup={(e) => setLabelX(e.currentTarget.value)}
      {type}
      style="width: 104px;"
    />
    <input
      checked={$style.label.line == LabelStyleLine.Line}
      onchange={(e) =>
        style.setLabelLine(e.currentTarget.checked ? LabelStyleLine.Line : LabelStyleLine.None)}
      type="checkbox"
    />
  {/if}

  <ColorPicker color={$style.color} {chartColors} onchange={(s) => updateColor(s)} />

  <ColorPicker color={$style.label.color} {chartColors} onchange={(s) => updateLabelColor(s)} />

  <input
    value={$style.width}
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
