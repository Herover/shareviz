<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Settings page shell: a page head (overline + title + breadcrumbs) and a
     two-column body with a sticky section sidenav and a stack of cards. -->

<script lang="ts">
  import type { Snippet } from "svelte";
  import Icon from "../Icon.svelte";
  import PageHead from "../PageHead.svelte";
  import type { ComponentProps } from "svelte";

  type IconName = ComponentProps<typeof Icon>["name"];

  interface Section {
    id: string;
    label: string;
    icon: IconName;
  }
  interface Crumb {
    label: string;
    href?: string;
  }

  interface Props {
    overline?: string;
    title: string;
    sections: Section[];
    crumbs?: Crumb[];
    children: Snippet;
  }
  let { overline, title, sections, crumbs, children }: Props = $props();

  let active = $state("");
  // Falls back to the first section until one is explicitly activated.
  const activeId = $derived(active || sections[0]?.id || "");

  const go = (e: Event, id: string) => {
    e.preventDefault();
    active = id;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Scroll-spy: mark whichever section sits at the vertical center of the
  // viewport as active. Recomputed (throttled to a frame) on scroll/resize.
  $effect(() => {
    const updateActive = () => {
      const center = window.innerHeight / 2;
      let bestId = "";
      let bestDist = Infinity;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= center && rect.bottom >= center) {
          bestId = section.id;
          break;
        }
        const dist = Math.abs(rect.top + rect.height / 2 - center);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = section.id;
        }
      }
      if (bestId) active = bestId;
    };

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateActive();
      });
    };

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  });
</script>

<div class="page">
  <PageHead {overline} {title} {crumbs} />

  <div class="layout">
    <nav class="sidenav">
      <div class="sidenav-label">Settings</div>
      {#each sections as section (section.id)}
        <!-- In-page scroll anchor, handled by the click handler below. -->
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a
          href={`#${section.id}`}
          class:is-active={activeId === section.id}
          onclick={(e) => go(e, section.id)}
        >
          <span class="sidenav-icon"><Icon name={section.icon} /></span>
          {section.label}
        </a>
      {/each}
    </nav>

    <div class="sections">
      {@render children()}
    </div>
  </div>
</div>

<style>
  /* ════════ LAYOUT ════════ */
  .layout {
    display: grid;
    grid-template-columns: 196px minmax(0, 1fr);
    gap: 40px;
    align-items: start;
  }
  @media (max-width: 720px) {
    .layout {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }

  /* ════════ SIDENAV ════════ */
  .sidenav {
    position: sticky;
    top: 84px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .sidenav-label {
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--fg-tertiary);
    padding: 0 10px 8px;
  }
  .sidenav a {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-size: 0.92rem;
    font-weight: 500;
    color: var(--fg-secondary);
    text-decoration: none;
    transition:
      background var(--duration-micro) var(--ease-standard),
      color var(--duration-micro) var(--ease-standard);
  }
  .sidenav a:hover {
    background: var(--bg-sunken);
    color: var(--fg-primary);
  }
  .sidenav a.is-active {
    background: var(--accent-primary);
    color: var(--fg-on-accent);
    font-weight: 600;
  }
  .sidenav-icon {
    display: inline-flex;
    flex-shrink: 0;
  }

  .sections {
    display: flex;
    flex-direction: column;
    gap: 28px;
    min-width: 0;
  }
</style>
