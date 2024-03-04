<script lang="ts">
  export let onChange: (val: any) => void;
  export let setValue: any;
  export let value: any;
  /** All radio buttons related to each other is in a group. This name must be unique on the current page. */
  export let group: string;
</script>

<input on:click={e => onChange(e.currentTarget.value)} checked={value == setValue} type="radio" name="{group}" value={setValue}/>
