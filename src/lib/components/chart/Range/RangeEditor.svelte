<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { type LineRepeatSettingsKey } from "$lib/chart";
  import { LineSymbol } from "$lib/chart";
  import { AxisStore } from "$lib/chartStores/axis.svelte";
  import type { categoryKeys, rangeCategoryKeys, RangeElement } from ".";
  import AxisEditor from "../AxisEditor.svelte";
  import CategoryList from "../CategoryList.svelte";
  import type { EditorComponentProps } from "../chartComponents";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";

  let { spec, chartSpec, chartData, connection, store }: EditorComponentProps<RangeElement> =
    $props();

  // Check if the data appears to have changed in a way where new range points have been added/removed
  const rangeCategoryValues = $derived(
    Object.keys(
      chartData[chartSpec.dataSet]?.data.reduce((acc, d) => {
        acc[d[chartSpec.pointLabel]] = true;
        return acc;
      }, {}),
    ),
  );
  $effect(() => {
    if (
      rangeCategoryValues.sort().join() !=
      chartSpec.rangeCategoryKeys
        .map((d) => d.k)
        .sort()
        .join()
    ) {
      const newVal: rangeCategoryKeys[] = categoryValues.map((d) => ({
        color: chartSpec.rangeCategoryKeys.find((c) => c.k == d)?.color ?? "#000000",
        k: d,
        label: {
          text: chartSpec.rangeCategoryKeys.find((c) => c.k == d)?.label.text ?? d,
        },
        symbol: LineSymbol.CIRCLE,
      }));
      store.submitOp([
        "rangeCategoryKeys",
        {
          r: 1,
          i: newVal,
        },
      ]);
    }
  });
  // Check if the data appears to have changed in a way where new range points have been added/removed
  const categoryValues = $derived(
    Object.keys(
      chartData[chartSpec.dataSet]?.data.reduce((acc, d) => {
        acc[d[chartSpec.categories]] = true;
        return acc;
      }, {}),
    ),
  );
  $effect(() => {
    if (
      categoryValues.sort().join() !=
      chartSpec.categoryKeys
        .map((d) => d.k)
        .sort()
        .join()
    ) {
      const newVal: categoryKeys[] = categoryValues.map((d) => ({
        k: d,
        label: {
          text: chartSpec.categoryKeys.find((c) => c.k == d)?.label.text ?? d,
        },
        symbol: LineSymbol.CIRCLE,
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

  const movePointDown = (k: string, i: number): void => {
    store.submitOp(["rangeCategoryKeys", [i, { p: 0 }], [i + 1, { d: 0 }]]);
  };

  const movePointUp = (k: string, i: number): void => {
    store.submitOp(["rangeCategoryKeys", [i - 1, { d: 0 }], [i, { p: 0 }]]);
  };

  const setPointLabelText = (val: string) => {
    selectedPoints.forEach((n) => {
      store.submitOp([
        "rangeCategoryKeys",
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

  const setPointColor = (val: string) => {
    selectedPoints.forEach((n) => {
      store.submitOp([
        "rangeCategoryKeys",
        n,
        "color",
        {
          r: 1,
          i: val,
        },
      ]);
    });
  };

  const pointSearch = (str: string, d: { k: string; d: unknown }): boolean => {
    return d.k.toLocaleLowerCase().includes(str.toLocaleLowerCase());
  };

  let selectedPoints: number[] = $state([]);
  const selectPoint = (values: { [key: string]: boolean }, indexes: number[]) => {
    selectedPoints = indexes;
  };

  const setDataSet = (v: string) =>
    store.submitOp([
      "dataSet",
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
  const setPointValue = (v: string) =>
    store.submitOp([
      "pointValue",
      {
        r: 1,
        i: v,
      },
    ]);

  const lineSearch = (str: string, d: { k: string; d: unknown }): boolean => {
    return d.k.toLocaleLowerCase().includes(str.toLocaleLowerCase());
  };

  let selectedLines: number[] = $state([]);
  const selectLine = (values: { [key: string]: boolean }, indexes: number[]) => {
    selectedLines = indexes;
  };
  const moveLineDown = (k: string, i: number): void => {
    store.submitOp(["categoryKeys", [i, { p: 0 }], [i + 1, { d: 0 }]]);
  };

  const moveLineUp = (k: string, i: number): void => {
    store.submitOp(["categoryKeys", [i - 1, { d: 0 }], [i, { p: 0 }]]);
  };
  const setLineLabelText = (val: string) => {
    selectedLines.forEach((n) => {
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
</script>

<h3 class="editor-sub-section">General</h3>

<div class="box">
  <div class="w-025 editor-explain-box">
    <span class="editor-column-label">Data set</span>
  </div>
  <div class="w-075 p-top-1">
    <select value={chartSpec.dataSet} onchange={(e) => setDataSet(e.currentTarget.value)}>
      <option></option>
      {#each spec.data.sets as set (set.id)}
        <option value={set.id}>{set.name}</option>
      {/each}
    </select>
  </div>
</div>

{#if chartSpec.dataSet}
  <p>
    <label class="editor-column-label">
      Repeat for every:
      <select value={chartSpec.repeat} onchange={(e) => setRepeat(e.currentTarget.value)}>
        <option></option>
        {#each chartData[chartSpec.dataSet].rows as row (row.key)}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>

  <p>
    <label class="editor-column-label">
      One line for every:
      <select value={chartSpec.categories} onchange={(e) => setCategories(e.currentTarget.value)}>
        <option></option>
        {#each chartData[chartSpec.dataSet].rows as row (row.key)}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
  {#snippet lineTitle(d: categoryKeys)}
    {d.k}
  {/snippet}
  <CategoryList
    moveDown={moveLineDown}
    moveUp={moveLineUp}
    onSelectedChanged={selectLine}
    searchFn={lineSearch}
    title={lineTitle}
    values={chartSpec.categoryKeys.map((d) => ({ k: d.k, d }))}
  />
  <div class="box">
    <div class="w-025 p-top-1">Label</div>
    <div class="w-075 p-top-1">
      <input
        value={selectedLines.length == 1
          ? (chartSpec.categoryKeys[selectedLines[0]]?.label.text ?? "")
          : ""}
        onkeyup={(e) => setLineLabelText(e.currentTarget.value)}
        disabled={selectedLines.length == 0}
      />
    </div>
  </div>

  <p>
    <label class="editor-column-label">
      One point for every:
      <select value={chartSpec.pointLabel} onchange={(e) => setPointLabel(e.currentTarget.value)}>
        <option></option>
        {#each chartData[chartSpec.dataSet].rows as row (row.key)}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>

  <p>
    <label class="editor-column-label">
      Point value:
      <select value={chartSpec.pointValue} onchange={(e) => setPointValue(e.currentTarget.value)}>
        <option></option>
        {#each chartData[chartSpec.dataSet].rows as row (row.key)}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>

  {#snippet pointTitle(d: LineRepeatSettingsKey)}
    {d.k}
  {/snippet}
  <CategoryList
    moveDown={movePointDown}
    moveUp={movePointUp}
    onSelectedChanged={selectPoint}
    searchFn={pointSearch}
    title={pointTitle}
    values={chartSpec.rangeCategoryKeys.map((d) => ({ k: d.k, d }))}
  />
  <div class="box">
    <div class="w-025 p-top-1">Label</div>
    <div class="w-075 p-top-1">
      <input
        value={selectedPoints.length == 1
          ? (chartSpec.rangeCategoryKeys[selectedPoints[0]]?.label.text ?? "")
          : ""}
        onkeyup={(e) => setPointLabelText(e.currentTarget.value)}
        disabled={selectedPoints.length == 0}
      />
    </div>
  </div>
  <div class="box">
    <div class="w-025 p-top-1">Color</div>
    <div class="w-075 p-top-1">
      <ColorPicker
        color={selectedPoints.length == 1
          ? (chartSpec.rangeCategoryKeys[selectedPoints[0]]?.color ?? "")
          : ""}
        onchange={(e) => setPointColor(e)}
      />
    </div>
  </div>

  <AxisEditor
    conf={new AxisStore(connection, chartSpec.axis, [...store.pathPrefix(), "axis"])}
    showRepeatControl={true}
  />
{/if}
