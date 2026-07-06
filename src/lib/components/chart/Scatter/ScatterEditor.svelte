<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import chroma from "chroma-js";
  import type { Color, ResponsiveColor } from "$lib/chart";
  import { AxisStore } from "$lib/chartStores/axis.svelte";
  import {
    ScatterCurve,
    ScatterLabelMode,
    ScatterXAxisLabelLocation,
    ScatterYAxisLabelLocation,
    type scatterCategoryKeys,
    type ScatterElement,
  } from ".";
  import AxisEditor from "../AxisEditor.svelte";
  import CategoryList from "../CategoryList.svelte";
  import type { EditorComponentProps } from "../chartComponents";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";
  import PresenceField from "../PresenceField.svelte";
  import AnnotationsEditor from "../Annotations/AnnotationsEditor.svelte";

  let {
    spec,
    chartSpec,
    chartData,
    connection,
    store,
    id,
    index,
  }: EditorComponentProps<ScatterElement> = $props();

  // New series get a random color that is visible on a white background, users
  // are expected to adjust them afterwards.
  const randomColor = (): ResponsiveColor => {
    const c = chroma
      .hsl(Math.random() * 360, 0.5 + Math.random() * 0.3, 0.3 + Math.random() * 0.25)
      .hex();
    return { light: { c, v: c } };
  };

  // Check if the data appears to have changed in a way where series have been added/removed.
  // An empty categories column means all points belong to a single unnamed series.
  const categoryValues = $derived(
    chartSpec.categories == ""
      ? [""]
      : Object.keys(
          chartData[chartSpec.dataSet]?.data.reduce((acc, d) => {
            acc[d[chartSpec.categories]] = true;
            return acc;
          }, {}) ?? {},
        ),
  );
  $effect(() => {
    if (
      // Length is compared separately because [""] and [] both join to ""
      categoryValues.length != chartSpec.categoryKeys.length ||
      categoryValues.sort().join() !=
        chartSpec.categoryKeys
          .map((d) => d.k)
          .sort()
          .join()
    ) {
      const newVal: scatterCategoryKeys[] = categoryValues.map((d) => ({
        color: chartSpec.categoryKeys.find((c) => c.k == d)?.color ?? randomColor(),
        k: d,
        label: {
          text: chartSpec.categoryKeys.find((c) => c.k == d)?.label.text ?? d,
        },
      }));
      store.submitOp([
        "categoryKeys",
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
  const setXKey = (v: string) =>
    store.submitOp([
      "x",
      "key",
      {
        r: 1,
        i: v,
      },
    ]);
  const setYKey = (v: string) =>
    store.submitOp([
      "y",
      "key",
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
  const setPointLabel = (v: string) =>
    store.submitOp([
      "pointLabel",
      {
        r: 1,
        i: v,
      },
    ]);
  const setRadius = (v: number) =>
    store.submitOp([
      "radius",
      {
        r: 1,
        i: v,
      },
    ]);
  const setRadiusValue = (v: string) =>
    store.submitOp([
      "radiusValue",
      {
        r: 1,
        i: v,
      },
    ]);
  const setConnect = (v: boolean) =>
    store.submitOp([
      "connect",
      {
        r: 1,
        i: v,
      },
    ]);
  const setCurve = (v: string) =>
    store.submitOp([
      "curve",
      {
        r: 1,
        i: v,
      },
    ]);

  const curveOptions = [
    { k: ScatterCurve.LINEAR, l: "Linear" },
    { k: ScatterCurve.CARDINAL, l: "Cardinal (smooth)" },
    { k: ScatterCurve.BUMP_X, l: "Bump X" },
    { k: ScatterCurve.BUMP_Y, l: "Bump Y" },
  ];

  const setLabelMode = (v: string) =>
    store.submitOp([
      "labelMode",
      {
        r: 1,
        i: v,
      },
    ]);

  const labelModeOptions = [
    { k: ScatterLabelMode.NONE, l: "No labels" },
    { k: ScatterLabelMode.FIRST, l: "At first point" },
    { k: ScatterLabelMode.LAST, l: "At last point" },
    { k: ScatterLabelMode.END_POINTS, l: "End points" },
    { k: ScatterLabelMode.ALL, l: "At all points" },
  ];

  const setXLabelText = (v: string) =>
    store.submitOp([
      "x",
      "label",
      "text",
      {
        r: 1,
        i: v,
      },
    ]);
  const setXLabelLocation = (v: string) =>
    store.submitOp([
      "x",
      "label",
      "location",
      {
        r: 1,
        i: v,
      },
    ]);
  const setYLabelText = (v: string) =>
    store.submitOp([
      "y",
      "label",
      "text",
      {
        r: 1,
        i: v,
      },
    ]);
  const setYLabelLocation = (v: string) =>
    store.submitOp([
      "y",
      "label",
      "location",
      {
        r: 1,
        i: v,
      },
    ]);

  const xLabelLocationOptions = [
    { k: ScatterXAxisLabelLocation.ABOVE, l: "Above the chart" },
    { k: ScatterXAxisLabelLocation.BELOW, l: "Below the chart" },
  ];
  const yLabelLocationOptions = [
    { k: ScatterYAxisLabelLocation.ABOVE_LEFT, l: "Above, left" },
    { k: ScatterYAxisLabelLocation.ABOVE_RIGHT, l: "Above, right" },
    { k: ScatterYAxisLabelLocation.ROTATED_LEFT, l: "Rotated, left" },
    { k: ScatterYAxisLabelLocation.ROTATED_RIGHT, l: "Rotated, right" },
    { k: ScatterYAxisLabelLocation.BELOW_LEFT, l: "Below, left" },
    { k: ScatterYAxisLabelLocation.BELOW_RIGHT, l: "Below, right" },
  ];
  const setOpacity = (v: number) =>
    store.submitOp([
      "opacity",
      {
        r: 1,
        i: v,
      },
    ]);
  const setHeightRatio = (v: number) =>
    store.submitOp([
      "heightRatio",
      {
        r: 1,
        i: v,
      },
    ]);

  const categorySearch = (str: string, d: { k: string; d: unknown }): boolean => {
    return d.k.toLocaleLowerCase().includes(str.toLocaleLowerCase());
  };

  let selectedCategories: number[] = $state([]);
  const selectCategory = (values: { [key: string]: boolean }, indexes: number[]) => {
    selectedCategories = indexes;
  };
  const moveCategoryDown = (k: string, i: number): void => {
    store.submitOp(["categoryKeys", [i, { p: 0 }], [i + 1, { d: 0 }]]);
  };
  const moveCategoryUp = (k: string, i: number): void => {
    store.submitOp(["categoryKeys", [i - 1, { d: 0 }], [i, { p: 0 }]]);
  };
  const setCategoryLabelText = (val: string) => {
    selectedCategories.forEach((n) => {
      store.submitOp([
        "categoryKeys",
        n,
        "label",
        "text",
        {
          r: 1,
          i: val,
        },
      ]);
    });
  };
  const setCategoryColor = (val: Color) => {
    selectedCategories.forEach((n) => {
      store.submitOp([
        "categoryKeys",
        n,
        "color",
        {
          r: 1,
          i: { light: val },
        },
      ]);
    });
  };
  const setDefaultColor = (val: Color) => {
    store.submitOp([
      "categoryKeys",
      0,
      "color",
      {
        r: 1,
        i: { light: val },
      },
    ]);
  };

  // Stable key of the singly-selected series, used for the shared presence address.
  let selCategoryKey = $derived(
    selectedCategories.length === 1 ? chartSpec.categoryKeys[selectedCategories[0]]?.k : undefined,
  );

  // Small multiples, one chart per value in the repeat column
  const setRepeat = (v: string) =>
    store.submitOp(["repeat", chartSpec.repeat == null ? { i: v } : { r: 1, i: v }]);
  const setRepeatColumns = (v: number) =>
    store.submitOp(["repeatColumns", chartSpec.repeatColumns == null ? { i: v } : { r: 1, i: v }]);

  // Check if the data appears to have changed in a way where charts have been added/removed
  const repeatValues = $derived(
    (chartSpec.repeat ?? "") == ""
      ? []
      : Object.keys(
          chartData[chartSpec.dataSet]?.data.reduce((acc, d) => {
            acc[d[chartSpec.repeat]] = true;
            return acc;
          }, {}) ?? {},
        ),
  );
  $effect(() => {
    const byKey = chartSpec.repeatSettings?.byKey ?? [];
    if (
      repeatValues.length != byKey.length ||
      repeatValues.sort().join() !=
        byKey
          .map((d) => d.k)
          .sort()
          .join()
    ) {
      const newVal = repeatValues.map(
        (k) => byKey.find((e) => e.k == k) ?? { k, title: "", ownChart: true, allCharts: false },
      );
      if (chartSpec.repeatSettings == null) {
        store.submitOp([
          "repeatSettings",
          {
            i: {
              byKey: newVal,
              default: { allCharts: false, k: "", ownChart: true, title: "" },
            },
          },
        ]);
      } else {
        store.submitOp(["repeatSettings", "byKey", { r: 1, i: newVal }]);
      }
    }
  });

  let selectedRepeats: number[] = $state([]);
  const selectRepeat = (values: { [key: string]: boolean }, indexes: number[]) => {
    selectedRepeats = indexes;
  };
  const repeatSearch = (str: string, d: { k: string; d: unknown }): boolean => {
    return d.k.toLocaleLowerCase().includes(str.toLocaleLowerCase());
  };
  const moveRepeatDown = (k: string, i: number): void => {
    store.submitOp(["repeatSettings", "byKey", [i, { p: 0 }], [i + 1, { d: 0 }]]);
  };
  const moveRepeatUp = (k: string, i: number): void => {
    store.submitOp(["repeatSettings", "byKey", [i - 1, { d: 0 }], [i, { p: 0 }]]);
  };
  const setRepeatTitle = (val: string) => {
    selectedRepeats.forEach((n) => {
      store.submitOp(["repeatSettings", "byKey", n, "title", { r: 1, i: val }]);
    });
  };
  const setRepeatOwnChart = (val: boolean) => {
    selectedRepeats.forEach((n) => {
      store.submitOp(["repeatSettings", "byKey", n, "ownChart", { r: 1, i: val }]);
    });
  };
  const setRepeatAllCharts = (val: boolean) => {
    selectedRepeats.forEach((n) => {
      store.submitOp(["repeatSettings", "byKey", n, "allCharts", { r: 1, i: val }]);
    });
  };

  // Stable key of the singly-selected chart, used for the shared presence address.
  let selRepeatKey = $derived(
    selectedRepeats.length === 1
      ? chartSpec.repeatSettings?.byKey[selectedRepeats[0]]?.k
      : undefined,
  );
</script>

<h3 class="editor-sub-section">General</h3>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="scatter-data-set">Data set</label>
  </div>
  <div>
    <PresenceField address={["chart", "elements", id, "d", "dataSet"]} {connection}>
      {#snippet field({ locked })}
        <select
          id="scatter-data-set"
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
      <label for="scatter-x-values">X values from</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "x", "key"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="scatter-x-values"
            value={chartSpec.x.key}
            disabled={locked}
            onchange={(e) => setXKey(e.currentTarget.value)}
          >
            <option></option>
            {#each chartData[chartSpec.dataSet].rows as row (row.key)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-y-values">Y values from</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "y", "key"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="scatter-y-values"
            value={chartSpec.y.key}
            disabled={locked}
            onchange={(e) => setYKey(e.currentTarget.value)}
          >
            <option></option>
            {#each chartData[chartSpec.dataSet].rows as row (row.key)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-point-labels">Point labels from</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "pointLabel"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="scatter-point-labels"
            value={chartSpec.pointLabel}
            disabled={locked}
            onchange={(e) => setPointLabel(e.currentTarget.value)}
          >
            <option></option>
            {#each chartData[chartSpec.dataSet].rows as row (row.key)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-label-mode">Show labels</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "labelMode"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="scatter-label-mode"
            value={chartSpec.labelMode}
            disabled={locked || chartSpec.pointLabel == ""}
            onchange={(e) => setLabelMode(e.currentTarget.value)}
          >
            {#each labelModeOptions as mode (mode.k)}
              <option value={mode.k}>{mode.l}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-height">Height</label> <span class="editor-label-hint">(% of width)</span>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "heightRatio"]} {connection}>
        {#snippet field({ locked })}
          <input
            id="scatter-height"
            value={chartSpec.heightRatio * 100}
            readonly={locked}
            onchange={(e) => setHeightRatio(Number.parseFloat(e.currentTarget.value) / 100)}
            type="number"
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-size-by">Size points by</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "radiusValue"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="scatter-size-by"
            value={chartSpec.radiusValue}
            disabled={locked}
            onchange={(e) => setRadiusValue(e.currentTarget.value)}
          >
            <option></option>
            {#each chartData[chartSpec.dataSet].rows as row (row.key)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-radius">Point size</label>
      <span class="editor-label-hint"
        >(px{chartSpec.radiusValue ? " for the largest value" : ""})</span
      >
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "radius"]} {connection}>
        {#snippet field({ locked })}
          <input
            id="scatter-radius"
            value={chartSpec.radius}
            readonly={locked}
            onchange={(e) => setRadius(Number.parseFloat(e.currentTarget.value))}
            type="number"
            min="1"
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-opacity">Opacity</label> <span class="editor-label-hint">(%)</span>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "opacity"]} {connection}>
        {#snippet field({ locked })}
          <input
            id="scatter-opacity"
            value={Math.round(chartSpec.opacity * 100)}
            readonly={locked}
            onchange={(e) => setOpacity(Number.parseFloat(e.currentTarget.value) / 100)}
            type="number"
            min="0"
            max="100"
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-connect">Connect points</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "connect"]} {connection}>
        {#snippet field({ locked })}
          <input
            id="scatter-connect"
            type="checkbox"
            checked={chartSpec.connect}
            disabled={locked}
            onchange={(e) => setConnect(e.currentTarget.checked)}
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  {#if chartSpec.connect}
    <div class="editor-row">
      <div class="editor-column-label">
        <label for="scatter-curve">Line shape</label>
      </div>
      <div>
        <PresenceField address={["chart", "elements", id, "d", "curve"]} {connection}>
          {#snippet field({ locked })}
            <select
              id="scatter-curve"
              value={chartSpec.curve}
              disabled={locked}
              onchange={(e) => setCurve(e.currentTarget.value)}
            >
              {#each curveOptions as curve (curve.k)}
                <option value={curve.k}>{curve.l}</option>
              {/each}
            </select>
          {/snippet}
        </PresenceField>
      </div>
    </div>
  {/if}

  <h3 class="editor-sub-section">Colors</h3>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-color-by">Color points by</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "categories"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="scatter-color-by"
            value={chartSpec.categories}
            disabled={locked}
            onchange={(e) => setCategories(e.currentTarget.value)}
          >
            <option></option>
            {#each chartData[chartSpec.dataSet].rows as row (row.key)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  {#if chartSpec.categories == ""}
    <div class="editor-row">
      <div class="editor-column-label">
        <span>Point color</span>
      </div>
      <div>
        <PresenceField
          address={["chart", "elements", id, "d", "categoryKeys", "", "color"]}
          {connection}
        >
          {#snippet field({ locked })}
            <ColorPicker
              color={chartSpec.categoryKeys[0]?.color.light.v ?? ""}
              disabled={chartSpec.categoryKeys.length == 0 || locked}
              onchange={(e) => setDefaultColor(e)}
            />
          {/snippet}
        </PresenceField>
      </div>
    </div>
  {:else}
    {#snippet categoryTitle(d: { k: string })}
      {d.k}
    {/snippet}
    <CategoryList
      moveDown={moveCategoryDown}
      moveUp={moveCategoryUp}
      onSelectedChanged={selectCategory}
      searchFn={categorySearch}
      title={categoryTitle}
      values={chartSpec.categoryKeys.map((d) => ({ k: d.k, d }))}
      {connection}
      addressFor={(item) => ["chart", "elements", id, "d", "categoryKeys", item.k]}
    />

    <div class="editor-row">
      <div class="editor-column-label">
        <label for="scatter-category-label">Label</label>
      </div>
      <div>
        <PresenceField
          address={["chart", "elements", id, "d", "categoryKeys", selCategoryKey ?? "", "label"]}
          connection={selCategoryKey ? connection : undefined}
        >
          {#snippet field({ locked })}
            <input
              id="scatter-category-label"
              type="text"
              value={selectedCategories.length == 1
                ? (chartSpec.categoryKeys[selectedCategories[0]]?.label.text ?? "")
                : ""}
              onkeyup={(e) => setCategoryLabelText(e.currentTarget.value)}
              disabled={selectedCategories.length == 0 || locked}
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
          address={["chart", "elements", id, "d", "categoryKeys", selCategoryKey ?? "", "color"]}
          connection={selCategoryKey ? connection : undefined}
        >
          {#snippet field({ locked })}
            <ColorPicker
              color={selectedCategories.length == 1
                ? (chartSpec.categoryKeys[selectedCategories[0]]?.color.light.v ?? "")
                : ""}
              disabled={selectedCategories.length == 0 || locked}
              onchange={(e) => setCategoryColor(e)}
            />
          {/snippet}
        </PresenceField>
      </div>
    </div>
  {/if}

  <h3 class="editor-sub-section">Small multiples</h3>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-repeat-for-every">Repeat for every</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "repeat"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="scatter-repeat-for-every"
            value={chartSpec.repeat ?? ""}
            disabled={locked}
            onchange={(e) => setRepeat(e.currentTarget.value)}
          >
            <option></option>
            {#each chartData[chartSpec.dataSet].rows as row (row.key)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  {#if (chartSpec.repeat ?? "") != ""}
    <div class="editor-row">
      <div class="editor-column-label">
        <label for="scatter-repeat-columns">Columns</label>
      </div>
      <div>
        <PresenceField address={["chart", "elements", id, "d", "repeatColumns"]} {connection}>
          {#snippet field({ locked })}
            <input
              id="scatter-repeat-columns"
              type="number"
              min="1"
              value={chartSpec.repeatColumns ?? 2}
              readonly={locked}
              onchange={(e) => setRepeatColumns(Number.parseInt(e.currentTarget.value))}
            />
          {/snippet}
        </PresenceField>
      </div>
    </div>

    {#snippet repeatTitle(d: { k: string })}
      {d.k}
    {/snippet}
    <CategoryList
      moveDown={moveRepeatDown}
      moveUp={moveRepeatUp}
      onSelectedChanged={selectRepeat}
      searchFn={repeatSearch}
      title={repeatTitle}
      values={(chartSpec.repeatSettings?.byKey ?? []).map((d) => ({ k: d.k, d }))}
      {connection}
      addressFor={(item) => ["chart", "elements", id, "d", "repeatSettings", "byKey", item.k]}
    />

    <div class="editor-row">
      <div class="editor-column-label">
        <label for="scatter-repeat-title">Title</label>
      </div>
      <div>
        <PresenceField
          address={[
            "chart",
            "elements",
            id,
            "d",
            "repeatSettings",
            "byKey",
            selRepeatKey ?? "",
            "title",
          ]}
          connection={selRepeatKey ? connection : undefined}
        >
          {#snippet field({ locked })}
            <input
              id="scatter-repeat-title"
              type="text"
              value={selectedRepeats.length == 1
                ? (chartSpec.repeatSettings?.byKey[selectedRepeats[0]]?.title ?? "")
                : ""}
              onkeyup={(e) => setRepeatTitle(e.currentTarget.value)}
              disabled={selectedRepeats.length == 0 || locked}
            />
          {/snippet}
        </PresenceField>
      </div>
    </div>

    <div class="editor-row">
      <div class="editor-column-label">
        <label for="scatter-repeat-own-chart">Has own chart</label>
      </div>
      <div>
        <PresenceField
          address={[
            "chart",
            "elements",
            id,
            "d",
            "repeatSettings",
            "byKey",
            selRepeatKey ?? "",
            "ownChart",
          ]}
          connection={selRepeatKey ? connection : undefined}
        >
          {#snippet field({ locked })}
            <input
              id="scatter-repeat-own-chart"
              type="checkbox"
              checked={selectedRepeats.length == 1
                ? (chartSpec.repeatSettings?.byKey[selectedRepeats[0]]?.ownChart ?? true)
                : false}
              disabled={selectedRepeats.length == 0 || locked}
              onchange={(e) => setRepeatOwnChart(e.currentTarget.checked)}
            />
          {/snippet}
        </PresenceField>
      </div>
    </div>

    <div class="editor-row">
      <div class="editor-column-label">
        <label for="scatter-repeat-all-charts">Show on all charts</label>
      </div>
      <div>
        <PresenceField
          address={[
            "chart",
            "elements",
            id,
            "d",
            "repeatSettings",
            "byKey",
            selRepeatKey ?? "",
            "allCharts",
          ]}
          connection={selRepeatKey ? connection : undefined}
        >
          {#snippet field({ locked })}
            <input
              id="scatter-repeat-all-charts"
              type="checkbox"
              checked={selectedRepeats.length == 1
                ? (chartSpec.repeatSettings?.byKey[selectedRepeats[0]]?.allCharts ?? false)
                : false}
              disabled={selectedRepeats.length == 0 || locked}
              onchange={(e) => setRepeatAllCharts(e.currentTarget.checked)}
            />
          {/snippet}
        </PresenceField>
      </div>
    </div>
  {/if}

  <h3 class="editor-sub-section">Annotations</h3>
  <AnnotationsEditor
    annotations={chartSpec.annotations}
    {store}
    {connection}
    {id}
    elementIndex={index}
    idPrefix="scatter-"
  />

  <h3 class="editor-sub-section">Horizontal axis</h3>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-x-axis-label">Axis label</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "x", "label", "text"]} {connection}>
        {#snippet field({ locked })}
          <input
            id="scatter-x-axis-label"
            type="text"
            value={chartSpec.x.label?.text ?? ""}
            readonly={locked}
            onkeyup={(e) => setXLabelText(e.currentTarget.value)}
            onchange={(e) => setXLabelText(e.currentTarget.value)}
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-x-axis-label-location">Label position</label>
    </div>
    <div>
      <PresenceField
        address={["chart", "elements", id, "d", "x", "label", "location"]}
        {connection}
      >
        {#snippet field({ locked })}
          <select
            id="scatter-x-axis-label-location"
            value={chartSpec.x.label?.location}
            disabled={locked}
            onchange={(e) => setXLabelLocation(e.currentTarget.value)}
          >
            {#each xLabelLocationOptions as location (location.k)}
              <option value={location.k}>{location.l}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <AxisEditor
    conf={new AxisStore(connection, chartSpec.x.axis, [...store.pathPrefix(), "x", "axis"])}
    {connection}
    address={["chart", "elements", id, "d", "x", "axis"]}
    idPrefix="scatter-x-"
  />

  <h3 class="editor-sub-section">Vertical axis</h3>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-y-axis-label">Axis label</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "y", "label", "text"]} {connection}>
        {#snippet field({ locked })}
          <input
            id="scatter-y-axis-label"
            type="text"
            value={chartSpec.y.label?.text ?? ""}
            readonly={locked}
            onkeyup={(e) => setYLabelText(e.currentTarget.value)}
            onchange={(e) => setYLabelText(e.currentTarget.value)}
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="scatter-y-axis-label-location">Label position</label>
    </div>
    <div>
      <PresenceField
        address={["chart", "elements", id, "d", "y", "label", "location"]}
        {connection}
      >
        {#snippet field({ locked })}
          <select
            id="scatter-y-axis-label-location"
            value={chartSpec.y.label?.location}
            disabled={locked}
            onchange={(e) => setYLabelLocation(e.currentTarget.value)}
          >
            {#each yLabelLocationOptions as location (location.k)}
              <option value={location.k}>{location.l}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <AxisEditor
    conf={new AxisStore(connection, chartSpec.y.axis, [...store.pathPrefix(), "y", "axis"])}
    {connection}
    address={["chart", "elements", id, "d", "y", "axis"]}
    idPrefix="scatter-y-"
  />
{/if}
