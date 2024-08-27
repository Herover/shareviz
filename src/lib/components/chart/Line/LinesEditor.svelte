<script lang="ts">
  import { LabelLocation, LabelStyleLine } from "$lib/chart";
  import type { db } from "$lib/chartStore";
  import { negativeOneToInf } from "$lib/utils";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";
  import type { formatData } from "./data";
  import LinesEditorLine from "./LinesEditorLine.svelte";

  export let chartColors: string[];
  export let values: ReturnType<typeof formatData>;
  export let lineSpec: ReturnType<ReturnType<typeof db.chart>["line"]>;

  let selected: { [key: string]: boolean } = {};
  let defaultSelected = false;
  let defaultStyle = lineSpec.defaultLineStyle();
  $: selectedIndexes = Object.keys(selected)
    .filter((k) => selected[k] !== false)
    .map((k) => {
      const i = $lineSpec.style.byKey.findIndex((e) => e.k === k);
      return {
        style: lineSpec.lineStyle(i),
        $style: $lineSpec.style.byKey[i],
        i,
        k,
      };
    });
  $: nonEditable =
    !defaultSelected &&
    (selectedIndexes.length == 0 ||
      selectedIndexes.findIndex((e) => e.i == -1) != -1);
  const chooseSelectedStyle = <T,>(merged: T, next: T): T | undefined =>
    typeof merged == "undefined" ? next : merged == next ? merged : undefined;
  $: mergedStyle = selectedIndexes
    .map((e) => e.$style)
    .reduce(
      (merged, next) => {
        if (typeof next == "undefined") return merged;

        merged.color = chooseSelectedStyle(merged.color, next.color);
        merged.width = chooseSelectedStyle(merged.width, next.width);
        merged.label.color = chooseSelectedStyle(
          merged.label.color,
          next.label.color,
        );
        merged.label.location = chooseSelectedStyle(
          merged.label.location,
          next.label.location,
        );
        merged.label.line = chooseSelectedStyle(
          merged.label.line,
          next.label.line,
        );
        merged.label.text = chooseSelectedStyle(
          merged.label.text,
          next.label.text,
        );
        merged.label.x = chooseSelectedStyle(merged.label.x, next.label.x);

        return merged;
      },
      defaultSelected
        ? $lineSpec.style.default
        : ({ label: {} } as {
            color: string | undefined;
            width: number | undefined;
            label: {
              color: string | undefined;
              location: string | undefined;
              line: string | undefined;
              text: string | undefined;
              x: number | undefined;
            };
          }),
    );

  const toggleSelect = (
    key: string | null,
    select: boolean,
    replace: boolean,
  ) => {
    if (replace) {
      if (key == null) {
        defaultSelected = true;
      } else {
        if (typeof selected[key] == "undefined") selected[key] = true;
        defaultSelected = false;
      }
      Object.keys(selected).forEach((k) => (selected[k] = k == key));
    } else {
      if (key == null) {
        defaultSelected = !defaultSelected;
      } else {
        selected[key] = !selected[key];
      }
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
    .map((d) => {
      const i = $lineSpec.style.byKey.findIndex((e) => e.k == d.key);
      return {
        d,
        style: i == -1 ? undefined : lineSpec.lineStyle(i),
        selected: selected[d.key] === true,
        // style: $lineSpec.style.byKey.find((e) => e.k == d.key),
      };
    });

  $: setLabelToKey = () => {
    selectedIndexes.forEach((d) => {
      if (d.i == -1) {
        lineSpec.addLineStyle($lineSpec.style.byKey.length, {
          key: d.k,
          labelText: d.k,
        });
      } else {
        d.style.setLabelText(d.k);
      }
    });

    if (defaultSelected) {
      lineSpec.defaultLineStyle().setLabelText("auto");
    }
  };
  $: setLineLabel = (label: string) => {
    selectedIndexes.forEach((d) => {
      if (d.i == -1) {
        lineSpec.addLineStyle($lineSpec.style.byKey.length, {
          key: d.k,
          labelText: label,
        });
      } else {
        d.style.setLabelText(label);
      }
    });

    if (defaultSelected) {
      lineSpec.defaultLineStyle().setLabelText(label);
    }
  };
  $: setLineColor = (color: string) => {
    selectedIndexes.forEach((d) => {
      const style = d.style;
      if (
        $lineSpec.style.byKey[d.i].label.color ==
        $lineSpec.style.byKey[d.i].color
      ) {
        style.setLabelColor(color);
      }
      style.setColor(color);
    });

    if (defaultSelected) {
      const style = lineSpec.defaultLineStyle();
      if (
        $lineSpec.style.default.label.color == $lineSpec.style.default.color
      ) {
        style.setLabelColor(color);
      }
      style.setColor(color);
    }
  };
  $: setTextColor = (color: string) => {
    selectedIndexes.forEach((d) => {
      d.style.setLabelColor(color);
    });

    if (defaultSelected) {
      lineSpec.defaultLineStyle().setLabelColor(color);
    }
  };
  $: setWidth = (width: number) => {
    selectedIndexes.forEach((d) => {
      d.style.setwidth(width);
    });

    if (defaultSelected) {
      lineSpec.defaultLineStyle().setwidth(width);
    }
  };
  $: setLabelLocation = (location: string) => {
    selectedIndexes.forEach((d) => {
      d.style.setLabelLocation(location);
    });

    if (defaultSelected) {
      lineSpec.defaultLineStyle().setLabelLocation(location);
    }
  };
  $: type = typeof values[0]?.value[0]?.x == "number" ? "number" : "date";
  $: setLabelX = (value: string) => {
    selectedIndexes.forEach((d) => {
      const style = d.style;
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
      d.style.setLabelLine(value);
    });
  };
</script>

<div class="line-list">
  <label>
    Search
    <input bind:value={searchString} class="line-search" />
  </label>
  <LinesEditorLine
    style={defaultStyle}
    selected={defaultSelected}
    {chartColors}
    on:onSelect={(e) => toggleSelect(null, e.detail.selected, e.detail.replace)}
  />
  {#each filteredValues as line}
    {#if line}
      <LinesEditorLine
        style={line.style}
        key={line.d.key}
        selected={line.selected}
        {chartColors}
        on:onSelect={(e) =>
          toggleSelect(line.d.key, e.detail.selected, e.detail.replace)}
      />
    {/if}
  {/each}
</div>

<div class="style-controls">
  <p>
    <label>
      Label
      <input
        value={typeof mergedStyle.label.text == "undefined"
          ? ""
          : mergedStyle.label.text}
        disabled={nonEditable}
        on:change={(e) => setLineLabel(e.currentTarget.value)}
      />
    </label>
    <button disabled={nonEditable} on:click={() => setLabelToKey()}>Auto</button
    >
  </p>
  <p>
    <span>
      Line color
      <ColorPicker
        color={typeof mergedStyle.color == "undefined"
          ? "#ffffff"
          : mergedStyle.color}
        {chartColors}
        disabled={nonEditable}
        on:change={(e) => setLineColor(e.detail)}
      />
      text color
      <ColorPicker
        color={typeof mergedStyle.label.color == "undefined"
          ? "#ffffff"
          : mergedStyle.label.color}
        {chartColors}
        disabled={nonEditable}
        on:change={(e) => setTextColor(e.detail)}
      />
    </span>
  </p>
  <p>
    <label>
      Width
      <input
        value={typeof mergedStyle.width == "undefined" ? "" : mergedStyle.width}
        disabled={nonEditable}
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
        value={typeof mergedStyle.label.location == "undefined"
          ? ""
          : mergedStyle.label.location}
        disabled={nonEditable}
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
        value={typeof mergedStyle.label.x == "undefined"
          ? ""
          : mergedStyle.label.x}
        disabled={nonEditable || defaultSelected}
        on:change={(e) => setLabelX(e.currentTarget.value)}
        type="number"
        style="width: 80px;"
      />
    </label>
    <label>
      Line
      <input
        checked={typeof mergedStyle.label.line == "undefined"
          ? false
          : mergedStyle.label.line == LabelStyleLine.Line}
        on:change={(e) =>
          setLabelLineStyle(
            e.currentTarget.checked ? LabelStyleLine.Line : LabelStyleLine.None,
          )}
        disabled={nonEditable || defaultSelected}
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
  .line-search {
    width: 100%;
  }
</style>
