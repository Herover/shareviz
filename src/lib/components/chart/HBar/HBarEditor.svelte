<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import chroma from "chroma-js";
  import type { ByKey, Color, HBar, ResponsiveColor } from "$lib/chart";
  import { HBarTotalLabelStyle } from "$lib/chart";
  import { AxisStore } from "$lib/chartStores/axis.svelte";
  import AxisEditor from "../AxisEditor.svelte";
  import CategoryList from "../CategoryList.svelte";
  import type { EditorComponentProps } from "../chartComponents";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";
  import PresenceField from "../PresenceField.svelte";

  let { spec, chartSpec, chartData, connection, store, id }: EditorComponentProps<HBar> = $props();

  // New color keys get a random color that is visible on a white background,
  // users are expected to adjust them afterwards.
  const randomColor = (): ResponsiveColor => {
    const c = chroma
      .hsl(Math.random() * 360, 0.5 + Math.random() * 0.3, 0.3 + Math.random() * 0.25)
      .hex();
    return { light: { c, v: c } };
  };

  let columns = $derived(chartData[chartSpec.dataSet]?.rows ?? []);

  // Bars are colored by their sub category when one is set, otherwise by their category
  let colorColumn = $derived(
    chartSpec.subCategories != "" ? chartSpec.subCategories : chartSpec.categories,
  );

  // Check if the data appears to have changed in a way where color keys have been added/removed
  const colorValues = $derived(
    colorColumn == ""
      ? []
      : Object.keys(
          chartData[chartSpec.dataSet]?.data.reduce((acc, d) => {
            acc[d[colorColumn]] = true;
            return acc;
          }, {}) ?? {},
        ),
  );
  $effect(() => {
    if (
      colorValues.length != chartSpec.colors.byKey.length ||
      [...colorValues].sort().join() !=
        chartSpec.colors.byKey
          .map((d) => d.k)
          .sort()
          .join()
    ) {
      const newVal: ByKey[] = colorValues.map((k) => {
        const existing = chartSpec.colors.byKey.find((c) => c.k == k);
        return {
          k,
          c: existing?.c ?? randomColor(),
          legend: existing?.legend ?? k,
        };
      });
      store.submitOp([
        "colors",
        "byKey",
        {
          r: 1,
          i: newVal,
        },
      ]);
    }
  });

  const setDataSet = (v: string) =>
    store.submitOp([
      "dataSet",
      {
        r: 1,
        i: v,
      },
    ]);
  const setCategories = (v: string) =>
    store.submitOp([
      "categories",
      {
        r: 1,
        i: v,
      },
    ]);
  const setSubCategories = (v: string) =>
    store.submitOp([
      "subCategories",
      {
        r: 1,
        i: v,
      },
    ]);
  const setStackSubCategories = (v: boolean) =>
    store.submitOp([
      "stackSubCategories",
      {
        r: 1,
        i: v,
      },
    ]);
  const setPortionSubCategories = (v: boolean) =>
    store.submitOp([
      "portionSubCategories",
      {
        r: 1,
        i: v,
      },
    ]);
  const setValue = (v: string) =>
    store.submitOp([
      "value",
      {
        r: 1,
        i: v,
      },
    ]);
  const setLabelWidth = (v: number) => {
    if (Number.isNaN(v)) return;
    store.submitOp([
      "labelWidth",
      {
        r: 1,
        i: v,
      },
    ]);
  };
  const setRectLabels = (v: boolean) =>
    store.submitOp([
      "rectLabels",
      {
        r: 1,
        i: v,
      },
    ]);
  const setTotalLabels = (v: string) =>
    store.submitOp([
      "totalLabels",
      {
        r: 1,
        i: v,
      },
    ]);
  const setRepeat = (v: string) =>
    store.submitOp([
      "repeat",
      {
        r: 1,
        i: v,
      },
    ]);

  const totalLabelOptions = [
    { k: HBarTotalLabelStyle.NONE, l: "None" },
    { k: HBarTotalLabelStyle.OUTSIDE, l: "After bars" },
  ];

  const colorSearch = (str: string, d: { k: string; d: unknown }): boolean => {
    return d.k.toLocaleLowerCase().includes(str.toLocaleLowerCase());
  };

  let selectedColors: number[] = $state([]);
  const selectColor = (values: { [key: string]: boolean }, indexes: number[]) => {
    selectedColors = indexes;
  };
  const moveColorDown = (k: string, i: number): void => {
    store.submitOp(["colors", "byKey", [i, { p: 0 }], [i + 1, { d: 0 }]]);
  };
  const moveColorUp = (k: string, i: number): void => {
    store.submitOp(["colors", "byKey", [i - 1, { d: 0 }], [i, { p: 0 }]]);
  };
  const setColorLegend = (val: string) => {
    selectedColors.forEach((n) => {
      store.submitOp([
        "colors",
        "byKey",
        n,
        "legend",
        {
          r: 1,
          i: val,
        },
      ]);
    });
  };
  const setColor = (val: Color) => {
    selectedColors.forEach((n) => {
      store.submitOp([
        "colors",
        "byKey",
        n,
        "c",
        {
          r: 1,
          i: { light: val },
        },
      ]);
    });
  };
  const setDefaultColor = (val: Color) =>
    store.submitOp([
      "colors",
      "default",
      {
        r: 1,
        i: { light: val },
      },
    ]);

  // Stable key of the singly-selected color, used for the shared presence address.
  let selColorKey = $derived(
    selectedColors.length === 1 ? chartSpec.colors.byKey[selectedColors[0]]?.k : undefined,
  );
</script>

<h3 class="editor-sub-section">General</h3>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="hbar-data-set">Data set</label>
  </div>
  <div>
    <PresenceField address={["chart", "elements", id, "d", "dataSet"]} {connection}>
      {#snippet field({ locked })}
        <select
          id="hbar-data-set"
          value={chartSpec.dataSet}
          disabled={locked}
          onchange={(e) => setDataSet(e.currentTarget.value)}
        >
          <option></option>
          {#each spec.data.sets as set (set.id)}
            <option value={set.id}>{set.name}</option>
          {/each}
        </select>
      {/snippet}
    </PresenceField>
  </div>
</div>

{#if chartSpec.dataSet}
  <div class="editor-row">
    <div class="editor-column-label">
      <label for="hbar-categories">One bar for every</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "categories"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="hbar-categories"
            value={chartSpec.categories}
            disabled={locked}
            onchange={(e) => setCategories(e.currentTarget.value)}
          >
            <option></option>
            {#each columns as column (column.key)}
              <option>{column.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="hbar-sub-categories">Split bars by</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "subCategories"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="hbar-sub-categories"
            value={chartSpec.subCategories}
            disabled={locked}
            onchange={(e) => setSubCategories(e.currentTarget.value)}
          >
            <option></option>
            {#each columns as column (column.key)}
              <option>{column.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="hbar-values-from">Values from</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "value"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="hbar-values-from"
            value={chartSpec.value}
            disabled={locked}
            onchange={(e) => setValue(e.currentTarget.value)}
          >
            <option></option>
            {#each columns.filter((r) => r.type == "number") as column (column.key)}
              <option>{column.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  {#if chartSpec.subCategories != ""}
    <div class="editor-row">
      <div class="editor-column-label">
        <label for="hbar-stack-sub-categories">Stack sub categories</label>
      </div>
      <div>
        <PresenceField address={["chart", "elements", id, "d", "stackSubCategories"]} {connection}>
          {#snippet field({ locked })}
            <input
              id="hbar-stack-sub-categories"
              checked={chartSpec.stackSubCategories}
              disabled={locked}
              onchange={(e) => setStackSubCategories(e.currentTarget.checked)}
              type="checkbox"
            />
          {/snippet}
        </PresenceField>
      </div>
    </div>

    {#if chartSpec.stackSubCategories}
      <div class="editor-row">
        <div class="editor-column-label">
          <label for="hbar-portion-sub-categories">Show as % of total</label>
        </div>
        <div>
          <PresenceField
            address={["chart", "elements", id, "d", "portionSubCategories"]}
            {connection}
          >
            {#snippet field({ locked })}
              <input
                id="hbar-portion-sub-categories"
                checked={chartSpec.portionSubCategories}
                disabled={locked}
                onchange={(e) => setPortionSubCategories(e.currentTarget.checked)}
                type="checkbox"
              />
            {/snippet}
          </PresenceField>
        </div>
      </div>
    {/if}
  {/if}

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="hbar-label-width">Label width</label>
      <span class="editor-label-hint">(px)</span>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "labelWidth"]} {connection}>
        {#snippet field({ locked })}
          <input
            id="hbar-label-width"
            value={chartSpec.labelWidth}
            readonly={locked}
            onchange={(e) => setLabelWidth(Number.parseInt(e.currentTarget.value))}
            type="number"
            min="0"
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="hbar-rect-labels">Value labels on bars</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "rectLabels"]} {connection}>
        {#snippet field({ locked })}
          <input
            id="hbar-rect-labels"
            checked={chartSpec.rectLabels}
            disabled={locked}
            onchange={(e) => setRectLabels(e.currentTarget.checked)}
            type="checkbox"
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="hbar-total-labels">Total labels</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "totalLabels"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="hbar-total-labels"
            value={chartSpec.totalLabels}
            disabled={locked}
            onchange={(e) => setTotalLabels(e.currentTarget.value)}
          >
            {#each totalLabelOptions as option (option.k)}
              <option value={option.k}>{option.l}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="hbar-repeat-for-each">Repeat for each</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "repeat"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="hbar-repeat-for-each"
            value={chartSpec.repeat}
            disabled={locked}
            onchange={(e) => setRepeat(e.currentTarget.value)}
          >
            <option></option>
            {#each columns as column (column.key)}
              <option>{column.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <h3 class="editor-sub-section">Colors</h3>

  <div class="editor-row">
    <div class="editor-column-label">
      <span>Default color</span>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "colors", "default"]} {connection}>
        {#snippet field({ locked })}
          <ColorPicker
            color={chartSpec.colors.default.light.v}
            disabled={locked}
            onchange={(e) => setDefaultColor(e)}
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  {#if colorColumn != ""}
    {#snippet colorTitle(d: { k: string })}
      {d.k}
    {/snippet}
    <CategoryList
      moveDown={moveColorDown}
      moveUp={moveColorUp}
      onSelectedChanged={selectColor}
      searchFn={colorSearch}
      title={colorTitle}
      values={chartSpec.colors.byKey.map((d) => ({ k: d.k, d }))}
      {connection}
      addressFor={(item) => ["chart", "elements", id, "d", "colors", "byKey", item.k]}
    />

    <div class="editor-row">
      <div class="editor-column-label">
        <label for="hbar-color-legend">Legend label</label>
      </div>
      <div>
        <PresenceField
          address={["chart", "elements", id, "d", "colors", "byKey", selColorKey ?? "", "legend"]}
          connection={selColorKey ? connection : undefined}
        >
          {#snippet field({ locked })}
            <input
              id="hbar-color-legend"
              type="text"
              value={selectedColors.length == 1
                ? (chartSpec.colors.byKey[selectedColors[0]]?.legend ?? "")
                : ""}
              onkeyup={(e) => setColorLegend(e.currentTarget.value)}
              disabled={selectedColors.length == 0 || locked}
            />
          {/snippet}
        </PresenceField>
      </div>
    </div>

    <div class="editor-row">
      <div class="editor-column-label">
        <span>Color</span>
      </div>
      <div>
        <PresenceField
          address={["chart", "elements", id, "d", "colors", "byKey", selColorKey ?? "", "c"]}
          connection={selColorKey ? connection : undefined}
        >
          {#snippet field({ locked })}
            <ColorPicker
              color={selectedColors.length == 1
                ? (chartSpec.colors.byKey[selectedColors[0]]?.c.light.v ?? "")
                : ""}
              disabled={selectedColors.length == 0 || locked}
              onchange={(e) => setColor(e)}
            />
          {/snippet}
        </PresenceField>
      </div>
    </div>
  {/if}

  <h3 class="editor-sub-section">Axis</h3>
  <AxisEditor
    conf={new AxisStore(connection, chartSpec.axis, [...store.pathPrefix(), "axis"])}
    {connection}
    address={["chart", "elements", id, "d", "axis"]}
    showRepeatControl={chartSpec.repeat != ""}
    idPrefix="hbar-"
  />
{/if}
