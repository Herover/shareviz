<script lang="ts">
  export let value: string | undefined | null = "";
  export let onChange: (val: string) => void
</script>

<input value={value} on:keyup={(e) => onChange(e.currentTarget.value)}/>