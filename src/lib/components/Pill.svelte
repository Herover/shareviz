<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Small rounded pill / badge. Shared by chart-list tags, member role badges,
     and inline labels. Pick the look with `variant` (fill) + `tone` (color). -->

<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    /** Fill style. */
    variant?: "soft" | "outline" | "solid";
    /** Color family applied to the chosen variant. */
    tone?: "neutral" | "primary" | "secondary";
    /** Size preset. */
    size?: "sm" | "md";
    /** Monospace font (for tags / codes). */
    mono?: boolean;
    /** Uppercase label styling (tracking + heavier weight). */
    uppercase?: boolean;
    /** Background override, e.g. a tag's own color. */
    color?: string;
    /** Adds a hover affordance (border + text emphasis). */
    interactive?: boolean;
    title?: string;
  }

  let {
    children,
    variant = "soft",
    tone = "neutral",
    size = "sm",
    mono = false,
    uppercase = false,
    color,
    interactive = false,
    title,
  }: Props = $props();
</script>

<span
  class="pill {variant} {tone} {size}"
  class:mono
  class:uppercase
  class:interactive
  style:background={color}
  {title}
>
  {@render children()}
</span>

<style>
  .pill {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    border: 1px solid transparent;
    border-radius: var(--radius-pill);
    font-family: var(--font-body);
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
  }
  .pill.mono {
    font-family: var(--font-mono);
  }
  .pill.uppercase {
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
  }

  /* sizes */
  .pill.sm {
    padding: 2px 7px;
    font-size: 0.7rem;
  }
  .pill.md {
    height: 30px;
    padding: 0 12px;
    font-size: 0.82rem;
  }

  /* soft — subtle tinted fill */
  .pill.soft.neutral {
    background: var(--bg-sunken);
    color: var(--fg-secondary);
  }
  .pill.soft.primary {
    background: var(--accent-primary-subtle);
    color: var(--accent-primary);
  }
  .pill.soft.secondary {
    background: var(--accent-secondary-subtle);
    color: var(--accent-secondary);
  }

  /* outline — bordered surface */
  .pill.outline {
    background: var(--bg-surface);
    border-color: var(--border-default);
    color: var(--fg-secondary);
  }

  /* solid — filled accent */
  .pill.solid.primary {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: var(--fg-on-accent);
  }
  .pill.solid.secondary {
    background: var(--accent-secondary);
    border-color: var(--accent-secondary);
    color: var(--fg-on-accent);
  }

  .pill.interactive:hover {
    border-color: var(--border-default);
    color: var(--fg-primary);
  }
</style>
