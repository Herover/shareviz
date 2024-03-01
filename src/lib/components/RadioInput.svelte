<script lang="ts">
  export let onChange: (val: any) => void;
  export let setValue: any;
  export let value: any;
  export let group: string;
</script>

<input on:click={e => onChange(e.currentTarget.value)} checked={value == setValue} type="radio" name="{group}" value={setValue}/>
