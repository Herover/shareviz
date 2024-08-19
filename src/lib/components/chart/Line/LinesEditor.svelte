<script lang="ts">
  import { LabelLocation, LabelStyleLine } from "$lib/chart";
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
  $: canEdit =
    selectedIndexes.length == 0 ||
    selectedIndexes.findIndex((e) => e.i == -1) != -1;

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
        Object.keys(e.d[0]).findIndex((k) =>
          ("" + e.d[0]?.[k]).toLowerCase().includes(searchString.toLowerCase()),
        ) != -1,
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
      if (last === next.color) {
        return last;
      } else {
        return 1;
      }
    },
    0 as string | number,
  );
  $: selectedTextColor = selectedIndexes.reduce(
    (last, nextI) => {
      const next = $lineSpec.style.byKey[nextI.i];
      if (typeof next == "undefined") {
        return "";
      }
      if (last === 0) {
        return next.label.color;
      }
      if (last === next.label.color) {
        return last;
      } else {
        return 1;
      }
    },
    0 as string | number,
  );
  $: selectedWidth = selectedIndexes.reduce(
    (last, nextI) => {
      const next = $lineSpec.style.byKey[nextI.i];
      if (typeof next == "undefined") {
        return "";
      }
      if (last === "") {
        return next.width;
      }
      if (last === next.width) {
        return last;
      } else {
        return "";
      }
    },
    "" as string | number,
  );
  $: selectedLabelLocation = selectedIndexes.reduce(
    (last, nextI) => {
      const next = $lineSpec.style.byKey[nextI.i];
      if (typeof next == "undefined") {
        return "";
      }
      if (last === "") {
        return next.label.location;
      }
      if (last === next.label.location) {
        return last;
      } else {
        return "";
      }
    },
    "" as string | number,
  );
  $: selectedLabelX = selectedIndexes.reduce(
    (last, nextI) => {
      const next = $lineSpec.style.byKey[nextI.i];
      if (typeof next == "undefined") {
        return "";
      }
      if (last === "") {
        return next.label.x;
      }
      if (last === next.label.x) {
        return last;
      } else {
        return "";
      }
    },
    "" as string | number,
  );
  $: selectedLabelLine = selectedIndexes.reduce(
    (last, nextI) => {
      const next = $lineSpec.style.byKey[nextI.i];
      if (typeof next == "undefined") {
        return null;
      }
      if (last === null) {
        return next.label.line;
      }
      if (last === next.label.line) {
        return last;
      } else {
        return null;
      }
    },
    null as LabelStyleLine | null,
  );

  $: setLabelToKey = () => {
    selectedIndexes.forEach((d) => {
      if (d.i == -1) {
        lineSpec.addLineStyle($lineSpec.style.byKey.length, {
          key: d.k,
          labelText: d.k,
        });
      } else {
        lineSpec.lineStyle(d.i).setLabelText(d.k);
      }
    });
  };
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
      const style = lineSpec.lineStyle(d.i);
      if (
        $lineSpec.style.byKey[d.i].label.color ==
        $lineSpec.style.byKey[d.i].color
      ) {
        style.setLabelColor(color);
      }
      style.setColor(color);
    });
  };
  $: setTextColor = (color: string) => {
    selectedIndexes.forEach((d) => {
      lineSpec.lineStyle(d.i).setLabelColor(color);
    });
  };
  $: setWidth = (width: number) => {
    selectedIndexes.forEach((d) => {
      lineSpec.lineStyle(d.i).setwidth(width);
    });
  };
  $: setLabelLocation = (location: string) => {
    selectedIndexes.forEach((d) => {
      lineSpec.lineStyle(d.i).setLabelLocation(location);
    });
  };
  $: type = typeof values[0]?.value[0]?.x == "number" ? "number" : "date";
  $: setLabelX = (value: string) => {
    selectedIndexes.forEach((d) => {
      const style = lineSpec.lineStyle(d.i);
      const parsed =
        type == "number" ? Number.parseInt(value) : new Date(value).getTime();
      const proposed = values
        .find((e) => e.key == d.k)
        ?.value.map((d) => ({
          d: Math.abs(parsed - (d.x as any)),
          x: d.x,
          y: d.y,
        }))
        .sort((a, b) => a.d - b.d)[0] || { x: 0, y: 0 };
      const proposedY = values
        .find((e) => e.key == d.k)
        ?.value.find((d) => d.x == proposed.x);
      if (typeof proposedY != "undefined") {
        style.setLabelY(proposed.y);
      }
      style.setLabelX(
        proposed.x instanceof Date ? proposed.x.getTime() : proposed.x,
      );
    });
  };
  $: setLabelLineStyle = (value: LabelStyleLine) => {
    selectedIndexes.forEach((d) => {
      lineSpec.lineStyle(d.i).setLabelLine(value);
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
            on:change={(e) => lineSpec.lineStyle(i).setColor(e.detail)}
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
    <button on:click={() => setLabelToKey()}>Auto</button>
  </p>
  <p>
    <span>
      Line color
      <ColorPicker
        color={typeof selectedColor == "string" && selectedColor != ""
          ? selectedColor
          : "#ffffff"}
        {chartColors}
        disabled={selectedIndexes.length == 0 || canEdit}
        on:change={(e) => setLineColor(e.detail)}
      />
      text color
      <ColorPicker
        color={typeof selectedTextColor == "string" && selectedTextColor != ""
          ? selectedTextColor
          : "#ffffff"}
        {chartColors}
        disabled={selectedIndexes.length == 0 || canEdit}
        on:change={(e) => setTextColor(e.detail)}
      />
    </span>
  </p>
  <p>
    <label>
      Width
      <input
        value={selectedWidth}
        disabled={canEdit}
        on:change={(e) => setWidth(Number.parseInt(e.currentTarget.value))}
        type="number"
        style="width: 80px"
      />
    </label>
  </p>
  <p>
    <label>
      Location
      <select
        value={selectedLabelLocation}
        disabled={canEdit}
        on:change={(e) => setLabelLocation(e.currentTarget.value)}
      >
        {#each Object.values(LabelLocation) as location}
          <option>{location}</option>
        {/each}
      </select>
    </label>
    <label>
      X value
      <input
        value={selectedLabelX}
        disabled={canEdit}
        on:change={(e) => setLabelX(e.currentTarget.value)}
        type="number"
        style="width: 80px;"
      />
    </label>
    <label>
      Line
      <input
        checked={selectedLabelLine == LabelStyleLine.Line}
        on:change={(e) =>
          setLabelLineStyle(
            e.currentTarget.checked ? LabelStyleLine.Line : LabelStyleLine.None,
          )}
        disabled={canEdit}
        type="checkbox"
      />
    </label>
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
