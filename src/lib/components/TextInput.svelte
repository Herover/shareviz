<script lang="ts">
  import { orDefault } from "$lib/utils";

  interface Props {
    value?: string | undefined | null;
    onChange: (val: string) => void;
  }

  let { value = "", onChange }: Props = $props();
</script>

<input value={orDefault(value, "")} onkeyup={(e) => onChange(e.currentTarget.value)}/>
