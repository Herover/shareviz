<script lang="ts">
  import type { db } from "$lib/chartStore";
  import { negativeOneToInf, orDefault } from "$lib/utils";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";
  import type { formatData } from "./data";

  export let chartColors: string[];
  export let values: ReturnType<typeof formatData>;
  export let lineSpec: ReturnType<ReturnType<typeof db.chart>["line"]>;

  let selected: { [key: string]: boolean } = {};
  $: selectedIndexes = Object.keys(selected)
    .filter((k) => selected[k])
    .map((k) => ({
      i: $lineSpec.style.byKey.findIndex((e) => e.k === k),
      k,
    }));

  const toggleSelect = (
    key: string,
    me: MouseEvent | null,
    ke?: KeyboardEvent,
  ) => {
    let replace = true;
    if (ke) {
      if (ke.code != "Enter" && ke.code != "Space") {
        return;
      }
      ke.preventDefault();
      if (ke.ctrlKey) {
        replace = false;
      }
    } else if (me) {
      if (me.ctrlKey) {
        replace = false;
      }
    }
    if (replace) {
      if (typeof selected[key] == "undefined") selected[key] = true;
      Object.keys(selected).forEach((k) => (selected[k] = k == key));
    } else {
      selected[key] = !selected[key];
    }
  };

  let searchString = "";
  $: filteredValues = values
    .filter(
      (e) =>
        e.key.toLowerCase().includes(searchString.toLowerCase()) ||
        e.label.toLowerCase().includes(searchString.toLowerCase()),
    )
    .sort(
      (a, b) =>
        negativeOneToInf($lineSpec.style.byKey.findIndex((e) => e.k == a.key)) -
        negativeOneToInf($lineSpec.style.byKey.findIndex((e) => e.k == b.key)),
    )
    .map((d) => ({
      d,
      style: $lineSpec.style.byKey.find((e) => e.k == d.key),
    }));

  $: selectedLabel = selectedIndexes.reduce(
    (last, nextI) => {
      const next = $lineSpec.style.byKey[nextI.i];
      if (typeof next == "undefined") {
        return "";
      }
      if (last === 0) {
        return next.label.text;
      }
      if (last === next.label.text) {
        return last;
      } else {
        return 1;
      }
    },
    0 as string | number,
  );
  $: selectedColor = selectedIndexes.reduce(
    (last, nextI) => {
      const next = $lineSpec.style.byKey[nextI.i];
      if (typeof next == "undefined") {
        return "";
      }
      if (last === 0) {
        return next.color;
      }
      if (last === next.color || last === 0) {
        return last;
      } else {
        return 1;
      }
    },
    0 as string | number,
  );

  $: setLineLabel = (label: string) => {
    selectedIndexes.forEach((d) => {
      if (d.i == -1) {
        lineSpec.addLineStyle($lineSpec.style.byKey.length, {
          key: d.k,
          labelText: label,
        });
      } else {
        lineSpec.lineStyle(d.i).setLabelText(label);
      }
    });
  };
  $: setLineColor = (color: string) => {
    selectedIndexes.forEach((d) => {
      if (d.i == -1) {
        lineSpec.addLineStyle($lineSpec.style.byKey.length, {
          key: d.k,
          labelText: d.k,
          color,
        });
      } else {
        lineSpec.lineStyle(d.i).setColor(color);
      }
    });
  };
</script>

<div class="line-list">
  <label>
    Search
    <input bind:value={searchString} class="line-search" />
  </label>
  {#each filteredValues as line, i}
    <div
      on:click={(e) => toggleSelect(line.d.key, e)}
      on:keydown={(e) => toggleSelect(line.d.key, null, e)}
      class:line-selected={selected[line.d.key] === true}
      class="line-item"
      role="button"
      tabindex="0"
    >
      <div class="line-text">
        {line.d.key}
      </div>
      <div class="line-buttons">
        {#if line.style}
          &#x25B2; &#x25BC; &nbsp;
          <ColorPicker
            color={orDefault(line.style?.color, "#00000000")}
            {chartColors}
            on:change={e => lineSpec.lineStyle(i).setColor(e.detail)}
          />
          &nbsp;
          <span
            on:click={() => lineSpec.lineStyle(i).delete()}
            on:keydown={(e) =>
              e.code == "Space" ? lineSpec.lineStyle(i).delete() : ""}
            role="button"
            tabindex="0"
            title="delete">❌</span
          >
        {/if}
      </div>
    </div>
  {/each}
</div>

<div class="style-controls">
  <p>
    <label>
      Label
      <input
        value={typeof selectedLabel == "string" ? selectedLabel : ""}
        on:change={(e) => setLineLabel(e.currentTarget.value)}
      />
    </label>
  </p>
  <p>
    <span>
      Line color
      <ColorPicker
        color={typeof selectedColor == "string" && selectedColor != ""
          ? selectedColor
          : "#ffffff"}
        {chartColors}
        on:change={(e) => setLineColor(e.detail)}
      />
    </span>
  </p>
</div>

<style>
  .line-list {
    width: 100%;
    height: 300px;
    overflow-y: scroll;
    border: 1px solid black;
    box-sizing: border-box;
  }
  .line-item {
    width: 100%;
    padding: 0.3em;
    display: flex;
    box-sizing: border-box;
    align-items: center;
  }
  .line-selected {
    background-color: #dddddd;
  }
  .line-search {
    width: 100%;
  }
  .line-text {
    cursor: pointer;
  }
  .line-buttons {
    margin-left: auto;
    height: 16px;
    display: flex;
    align-items: center;
  }
</style>
