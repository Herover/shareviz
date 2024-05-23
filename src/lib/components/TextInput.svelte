<script lang="ts">
  import { orDefault } from "$lib/utils";

  export let value: string | undefined | null = "";
  export let onChange: (val: string) => void
</script>

<input value={orDefault(value, "")} on:keyup={(e) => onChange(e.currentTarget.value)}/>
