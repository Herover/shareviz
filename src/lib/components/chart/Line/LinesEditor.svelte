<script lang="ts">
  import { LabelLocation, LabelStyleLine, LineMissingStyle, LineSymbol } from "$lib/chart";
  import type { db } from "$lib/chartStore";
  import { negativeOneToInf } from "$lib/utils";
  import { onDestroy, onMount } from "svelte";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";
  import type { formatData } from "./data";
  import LinesEditorLine from "./LinesEditorLine.svelte";

  interface Props {
    chartColors: string[];
    values: ReturnType<typeof formatData>;
    lineSpec: ReturnType<ReturnType<typeof db.chart>["line"]>;
    index: number;
  }

  let { chartColors, values, lineSpec, index }: Props = $props();

  let selected: { [key: string]: boolean } = $state({});
  let defaultSelected = $state(false);
  let defaultStyle = lineSpec.defaultLineStyle();
  let selectedIndexes = $derived(
    Object.keys(selected)
      .filter((k) => selected[k] !== false)
      .map((k) => {
        const i = $lineSpec.style.byKey.findIndex((e) => e.k === k);
        return {
          style: lineSpec.lineStyle(i),
          $style: $lineSpec.style.byKey[i],
          i,
          k,
        };
      }),
  );
  let nonEditable = $derived(
    !defaultSelected &&
      (selectedIndexes.length == 0 || selectedIndexes.findIndex((e) => e.i == -1) != -1),
  );
  const chooseSelectedStyle = <T,>(merged: T, next: T): T | undefined =>
    typeof merged == "undefined" ? next : merged == next ? merged : undefined;
  let mergedStyle = $derived(
    selectedIndexes
      .map((e) => e.$style)
      .reduce(
        (merged, next) => {
          if (typeof next == "undefined") return merged;

          merged.color = chooseSelectedStyle(merged.color, next.color);
          merged.width = chooseSelectedStyle(merged.width, next.width);
          merged.label.color = chooseSelectedStyle(merged.label.color, next.label.color);
          merged.label.location = chooseSelectedStyle(merged.label.location, next.label.location);
          merged.label.line = chooseSelectedStyle(merged.label.line, next.label.line);
          merged.label.text = chooseSelectedStyle(merged.label.text, next.label.text);
          merged.label.x = chooseSelectedStyle(merged.label.x, next.label.x);
          merged.symbols = chooseSelectedStyle(merged.symbols, next.symbols);
          merged.missingStyle = chooseSelectedStyle(merged.missingStyle, next.missingStyle);

          return merged;
        },
        defaultSelected
          ? // Manual deep copy, `{ ...$defaultStyle }` copies some reactivity-stuff we do not want to copy!
            {
              color: $defaultStyle.color,
              width: $defaultStyle.width,
              label: {
                color: $defaultStyle.label.color,
                location: $defaultStyle.label.location,
                line: $defaultStyle.label.line,
                text: $defaultStyle.label.text,
                x: $defaultStyle.label.x,
              },
              symbols: $defaultStyle.symbols,
              missingStyle: $defaultStyle.missingStyle,
            }
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
              symbols: string | undefined;
              missingStyle: string | undefined;
            }),
      ),
  );

  let rangedSelect = $state(false);
  let lastSelected: number | null = $state(-1);
  const keyDown = (e: KeyboardEvent) => {
    if (e.key == "Shift") {
      rangedSelect = true;
    }
  };
  const keyUp = (e: KeyboardEvent) => {
    if (e.key == "Shift") {
      rangedSelect = false;
    }
  };
  onMount(() => {
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
  });
  onDestroy(() => {
    window.removeEventListener("keydown", keyDown);
    window.removeEventListener("keyup", keyUp);
  });

  type Value = (typeof values)[number];
  let flatValues = $derived(
    values
      .reduce(
        (acc, d) => {
          acc = [...acc, ...d.d];
          return acc;
        },
        [] as Value["d"],
      )
      .filter((e, i, arr) => arr.findIndex((e2) => e2.key == e.key) >= i),
  );
  let searchString = $state("");
  let filteredValues = $derived(
    flatValues
      .filter((e) => e.key.toLocaleLowerCase().includes(searchString.toLocaleLowerCase()))
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
          // style: $lineSpec.style.byKey.find((e) => e.k == d.key),
        };
      }),
  );

  let toggleSelect = $derived(
    (key: string | null, select: boolean, replace: boolean, lineIndex: number | null) => {
      if (rangedSelect) {
        if (lineIndex == null) {
          defaultSelected = true;
          lineIndex = 0;
        }
        if (lastSelected == null) {
          defaultSelected = true;
          lastSelected = 0;
        }
        for (
          let i = Math.min(lineIndex, lastSelected);
          i <= Math.max(lineIndex, lastSelected);
          i++
        ) {
          if (i < 0 || filteredValues.length <= i) continue;
          const element = filteredValues[i];
          selected[element.d.key] = true;
        }
        document.getSelection()?.removeAllRanges();
      } else if (replace) {
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

      lastSelected = lineIndex;
    },
  );

  let setLabelToKey = $derived(() => {
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
  });
  let setLineLabel = $derived((label: string) => {
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
  });
  let setLineColor = $derived((color: string) => {
    selectedIndexes.forEach((d) => {
      const style = d.style;
      if ($lineSpec.style.byKey[d.i].label.color == $lineSpec.style.byKey[d.i].color) {
        style.setLabelColor(color);
      }
      style.setColor(color);
    });

    if (defaultSelected) {
      const style = lineSpec.defaultLineStyle();
      if ($lineSpec.style.default.label.color == $lineSpec.style.default.color) {
        style.setLabelColor(color);
      }
      style.setColor(color);
    }
  });
  let setTextColor = $derived((color: string) => {
    selectedIndexes.forEach((d) => {
      d.style.setLabelColor(color);
    });

    if (defaultSelected) {
      lineSpec.defaultLineStyle().setLabelColor(color);
    }
  });
  let setWidth = $derived((width: number) => {
    selectedIndexes.forEach((d) => {
      d.style.setwidth(width);
    });

    if (defaultSelected) {
      lineSpec.defaultLineStyle().setwidth(width);
    }
  });
  let setLabelLocation = $derived((location: string) => {
    selectedIndexes.forEach((d) => {
      d.style.setLabelLocation(location);
    });

    if (defaultSelected) {
      lineSpec.defaultLineStyle().setLabelLocation(location);
    }
  });
  let type = $derived(typeof flatValues[0]?.value[0]?.x == "number" ? "number" : "date");
  let setLabelX = $derived((value: string) => {
    selectedIndexes.forEach((d) => {
      const style = d.style;
      const parsed = type == "number" ? Number.parseInt(value) : new Date(value).getTime();
      const proposed = flatValues
        .find((e) => e.key == d.k)
        ?.value.map((d) => ({
          d: Math.abs(parsed - (d.x as any)),
          x: d.x,
          y: d.y,
        }))
        .sort((a, b) => a.d - b.d)[0] || { x: 0, y: 0 };
      const proposedY = flatValues.find((e) => e.key == d.k)?.value.find((d) => d.x == proposed.x);
      if (typeof proposedY != "undefined") {
        style.setLabelY(proposed.y);
      }
      style.setLabelX(proposed.x instanceof Date ? proposed.x.getTime() : proposed.x);
    });
  });
  let setLabelLineStyle = $derived((value: LabelStyleLine) => {
    selectedIndexes.forEach((d) => {
      d.style.setLabelLine(value);
    });
  });
  let setSymbols = $derived((symbols: string) => {
    selectedIndexes.forEach((d) => {
      d.style.setSymbols(symbols);
    });

    if (defaultSelected) {
      lineSpec.defaultLineStyle().setSymbols(symbols);
    }
  });
  let setMissingStyle = $derived((style: string) => {
    selectedIndexes.forEach((d) => {
      d.style.setMissingStyle(style);
    });

    if (defaultSelected) {
      lineSpec.defaultLineStyle().setMissingStyle(style);
    }
  });
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
    onSelect={(d) => toggleSelect(null, d.selected, d.replace, null)}
  />
  {#each filteredValues as line, i}
    {#if line}
      <LinesEditorLine
        style={line.style}
        key={line.d.key}
        selected={selected[line.d.key]}
        {chartColors}
        {index}
        onSelect={(d) => toggleSelect(line.d.key, d.selected, d.replace, i)}
      />
    {/if}
  {/each}
</div>

<div class="style-controls">
  <p>
    <label>
      Label
      <input
        value={typeof mergedStyle.label.text == "undefined" ? "" : mergedStyle.label.text}
        disabled={nonEditable && selectedIndexes.length != 1}
        onchange={(e) => setLineLabel(e.currentTarget.value)}
        onkeyup={(e) => setLineLabel(e.currentTarget.value)}
      />
    </label>
    <button disabled={selectedIndexes.length == 0} onclick={() => setLabelToKey()}>Auto</button>
  </p>
  <p>
    <span>
      Line color
      <ColorPicker
        color={typeof mergedStyle.color == "undefined" ? "#ffffff" : mergedStyle.color}
        {chartColors}
        disabled={nonEditable}
        onchange={(s) => setLineColor(s)}
      />
      text color
      <ColorPicker
        color={typeof mergedStyle.label.color == "undefined" ? "#ffffff" : mergedStyle.label.color}
        {chartColors}
        disabled={nonEditable}
        onchange={(s) => setTextColor(s)}
      />
    </span>
  </p>
  <p>
    <label>
      Width
      <input
        value={typeof mergedStyle.width == "undefined" ? "" : mergedStyle.width}
        disabled={nonEditable}
        onchange={(e) => setWidth(Number.parseInt(e.currentTarget.value))}
        type="number"
        style="width: 80px"
      />
    </label>
  </p>
  <p>
    <label>
      Location
      <select
        value={typeof mergedStyle.label.location == "undefined" ? "" : mergedStyle.label.location}
        disabled={nonEditable}
        onchange={(e) => setLabelLocation(e.currentTarget.value)}
      >
        {#each Object.values(LabelLocation) as location}
          <option>{location}</option>
        {/each}
      </select>
    </label>
    <label>
      X value
      <input
        value={typeof mergedStyle.label.x == "undefined" ? "" : mergedStyle.label.x}
        disabled={nonEditable || defaultSelected}
        onchange={(e) => setLabelX(e.currentTarget.value)}
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
        onchange={(e) =>
          setLabelLineStyle(e.currentTarget.checked ? LabelStyleLine.Line : LabelStyleLine.None)}
        disabled={nonEditable || defaultSelected}
        type="checkbox"
      />
    </label>
  </p>
  <p>
    <label>
      Symbols
      <select
        value={typeof mergedStyle.symbols == "undefined" ? "" : mergedStyle.symbols}
        disabled={nonEditable}
        onchange={(e) => setSymbols(e.currentTarget.value)}
      >
        {#each Object.values(LineSymbol) as symbol}
          <option>{symbol}</option>
        {/each}
      </select>
    </label>

    <label>
      Missing data
      <select
        value={typeof mergedStyle.missingStyle == "undefined" ? "" : mergedStyle.missingStyle}
        disabled={nonEditable}
        onchange={(e) => setMissingStyle(e.currentTarget.value)}
      >
        {#each Object.values(LineMissingStyle) as style}
          <option>{style}</option>
        {/each}
      </select>
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
