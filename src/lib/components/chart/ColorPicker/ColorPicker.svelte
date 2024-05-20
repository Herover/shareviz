<script lang="ts">
  import chroma from "chroma-js";
  import { createEventDispatcher } from "svelte";
  import ColorComponent from "./ColorComponent.svelte";

  export let color: string;

  let cc = [0, 0, 0];

  $: try {
    cc = chroma(color).hcl();
  } catch (e) {
    cc = [0, 0, 0];
  }
  $: [h, c, l] = cc;

  const hueStep = 18;
  const chromaStep = 5;
  const lightnessStep = 5;

  let open = false;
  let input: HTMLInputElement | undefined;
  let container: HTMLDivElement | undefined;

  let opened = 0;
  const ev = (e: MouseEvent) => {
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
    }
  };

  $: if (open) {
    input?.focus();
    opened = Date.now() + 100;
    document.addEventListener("click", ev);
  } else {
    document.removeEventListener("click", ev);
  }

  const dispatch = createEventDispatcher<{ change: string }>();
</script>

<div class="holder" bind:this={container}>
  <div
    style:background-color={color}
    on:click={() => (open = !open)}
    on:keydown={() => (open = !open)}
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
        /><ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          {c}
          {l}
        /><ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          h={h + hueStep}
          {c}
          {l}
        />
      </div>
      <div class="component-row">
        <ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          c={c - chromaStep}
          {l}
        /><ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          {c}
          {l}
        /><ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          c={c + chromaStep}
          {l}
        />
      </div>
      <div class="component-row">
        <ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          {c}
          l={l - lightnessStep}
        /><ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          {c}
          {l}
        /><ColorComponent
          on:click={(e) => dispatch("change", e.detail)}
          {h}
          {c}
          l={l + lightnessStep}
        />
      </div>
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
  }
  .color-display {
    width: 100%;
    height: 100%;
  }
</style>
