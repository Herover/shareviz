<script lang="ts">
  interface Props {
    children: () => ReturnType<import("svelte").Snippet>;
    title: string;
  }

  let { children, title }: Props = $props();
</script>

<div class="holder">
  <div class="header">
    {title}
  </div>
  <div class="content">
    {@render children()}
  </div>
</div>

<style>
  .holder {
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    background-color: var(--bg-surface);
    overflow: hidden;
    box-shadow: var(--shadow-1);
    margin: var(--space-6) 0 var(--space-6) 0;
  }
  .header,
  .content {
    padding: var(--space-3) var(--space-4);
  }
  .header {
    background-color: var(--color-warm-50);
    color: var(--color-warm-600);
    border-bottom: 1px solid var(--border-default);
    font-weight: var(--weight-bold);
  }
</style>
