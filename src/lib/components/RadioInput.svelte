<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  interface Props {
    onChange: (val: any) => void;
    setValue: any;
    value: any;
    /** All radio buttons related to each other is in a group. This name must be unique on the current page. */
    group: string;
  }

  let { onChange, setValue, value, group }: Props = $props();
</script>

<input
  onclick={(e) => onChange(e.currentTarget.value)}
  checked={value == setValue}
  type="radio"
  name={group}
  value={setValue}
/>
