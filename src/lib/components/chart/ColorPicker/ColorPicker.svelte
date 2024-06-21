<script lang="ts">
  import chroma from "chroma-js";
  import { createEventDispatcher } from "svelte";
  import ColorComponent from "./ColorComponent.svelte";

  export let color: string;

  // From https://github.com/d3/d3-scale-chromatic/blob/main/src/categorical/Paired.js
  export let scheme = [
    "#a6cee3",
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00",
    "#cab2d6",
    "#6a3d9a",
    "#ffff99",
    "#b15928",
  ];

  export let chartColors: string[] = [];

  let cc = [0, 0, 0];

  $: try {
    if (color.startsWith("lch")) {
      const parts = color.match(/(\d+\.?\d*)/g);
      if (parts && parts.length == 3) {
        cc = [
          Math.max(Math.min(Number.parseFloat(parts[0]), 100), 0),
          Math.max(Math.min(Number.parseFloat(parts[1]), 100), 0),
          Number.parseFloat(parts[2]) % 360,
        ];
      }
    } else {
      cc = chroma(color).lch();
    }
  } catch (e) {
    console.warn(e);
    cc = [0, 0, 0];
  }
  $: [l, c, h] = cc;

  const hueStep = 18;
  const chromaStep = 5;
  const lightnessStep = 5;

  let open = false;
  let input: HTMLInputElement | undefined;
  let container: HTMLDivElement | undefined;

  let opened = 0;
  const ev = (e: MouseEvent | KeyboardEvent) => {
    if (
      // If click happens at same time as opening, it was the click that opened us.
      opened < Date.now() &&
      !(
        // Detect if click is inside color-picker by checking if click is on the container element.
        // TODO: make more generic in case we nest components more than 3 times.
        (
          (e.target as HTMLElement)?.parentElement === container ||
          (e.target as HTMLElement)?.parentElement?.parentElement ===
            container ||
          (e.target as HTMLElement)?.parentElement?.parentElement
            ?.parentElement === container
        )
      )
    ) {
      open = false;
    } else if (e instanceof KeyboardEvent && e.code == "Escape") {
      open = false;
    }
  };

  $: if (open) {
    input?.focus();
    opened = Date.now() + 100;
    document.addEventListener("click", ev);
    document.addEventListener("keyup", ev);
  } else {
    document.removeEventListener("click", ev);
    document.removeEventListener("keyup", ev);
  }

  const dispatch = createEventDispatcher<{ change: string }>();

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code != "Enter" && e.code != "Space") {
      return;
    }
    e.preventDefault();
    open = !open;
  };
</script>

<div class="holder" bind:this={container}>
  <div
    style:background-color={color}
    on:click={() => (open = !open)}
    on:keydown={(e) => onKeyDown(e)}
    class="color-display"
    role="button"
    tabindex="0"
  ></div>
  {#if open}
    <div class="popout">
      <input
        value={color}
        bind:this={input}
        on:change={(e) => dispatch("change", e.currentTarget.value)}
        on:keyup={(e) => dispatch("change", e.currentTarget.value)}
      />

      <div class="component-row">
        <ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          h={h - hueStep}
          {c}
          {l}
          title="Hue left"
        /><ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          {c}
          {l}
          title="Current color"
        /><ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          h={h + hueStep}
          {c}
          {l}
          title="Hue right"
        />
      </div>
      <div class="component-row">
        <ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          c={c - chromaStep}
          {l}
          title="Chroma/saturation down"
        /><ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          {c}
          {l}
          title="Current color"
        /><ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          c={c + chromaStep}
          {l}
          title="Chroma/saturation up"
        />
      </div>
      <div class="component-row">
        <ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          {c}
          l={l - lightnessStep}
          title="Lightness down"
        /><ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          {c}
          {l}
          title="Current color"
        /><ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          {c}
          l={l + lightnessStep}
          title="Lightness up"
        />
      </div>

      {#each scheme as c}
        <div class="holder">
          <div
            style:background-color={c}
            on:click={() => dispatch("change", c)}
            on:keyup={(e) => e.key === " " && dispatch("change", c)}
            class="color-display"
            role="button"
            tabindex="0"
          ></div>
        </div>
      {/each}

      {#each chartColors as c}
        <div class="holder">
          <div
            style:background-color={c}
            on:click={() => dispatch("change", c)}
            on:keyup={(e) => e.key === " " && dispatch("change", c)}
            class="color-display"
            role="button"
            tabindex="0"
          ></div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .component-row {
    width: 100%;
  }
  .popout {
    position: absolute;
    top: 100%;
    left: calc(-50px + 50% - 16px);
    width: 100px;
    border: 2px solid black;
    background-color: #ffffff;
    margin: 8px;
    padding: 8px;
    z-index: 1;
    /* border-radius: 8px; */
  }
  .popout input {
    box-sizing: border-box;
    width: 100%;
  }
  .holder {
    position: relative;
    width: 1em;
    height: 1em;
    display: inline-block;
    cursor: pointer;
    box-sizing: border-box;
    border: 1px solid black;
  }
  .color-display {
    width: 100%;
    height: 100%;
  }
</style>
