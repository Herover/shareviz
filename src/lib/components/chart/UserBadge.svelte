<script lang="ts">
  interface Props {
    user: {
      id: string;
      name: string;
      image?: string;
      color?: string;
    };
    fill?: boolean;
  }

  let { user, fill }: Props = $props();

  const palette = [
    "var(--color-slate-500)",
    "var(--color-terra-500)",
    "var(--color-sage-500)",
    "var(--color-amber-500)",
    "var(--color-slate-300)",
    "var(--color-terra-300)",
    "var(--color-sage-300)",
    "var(--color-amber-300)",
  ];
  const color = $derived.by(() => {
    if (user.color) {
      return user.color;
    }
    let hash = 0;
    for (let i = 0; i < user.id.length; i++) hash = (hash * 31 + user.id.charCodeAt(i)) | 0;
    return palette[Math.abs(hash) % palette.length];
  });

  const initial = (name: string) => (name.trim()[0] ?? "?").toUpperCase();
</script>

<div class="badge" class:fill style:background-color={color} title={user.image ? null : user.name}>
  {#if user.image}
    <!-- There's already a explaining title attribute on the parent -->
    <!-- svelte-ignore a11y_missing_attribute -->
    <img src={user.image} title={user.name} />
  {:else}
    {initial(user.name)}
  {/if}
</div>

<style>
  .badge {
    display: inline-block;
    width: 1.4em;
    height: 1.4em;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9em;
    font-weight: 600;
    color: var(--fg-on-accent);
    /* border: 1px solid var(--bg-surface); */
    overflow: hidden;
    pointer-events: fill;
  }
  .fill {
    height: 100%;
    width: 100%;
  }
  .badge img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: fill;
  }
</style>
