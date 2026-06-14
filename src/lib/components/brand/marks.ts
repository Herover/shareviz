// SPDX-License-Identifier: MPL-2.0

// Registry of brand icon marks explored in the design handoff
// (preview/brand-logo.html). Each mark is a self-contained SVG component that
// shares the same prop shape so they are interchangeable in the wordmark
// lockup (see Brand.svelte) and on the /brand preview page.

import type { Component } from "svelte";
import TortillaMark from "./TortillaMark.svelte";
import FilledTortillaMark from "./FilledTortillaMark.svelte";
import SliceMark from "./SliceMark.svelte";
import CommonGroundMark from "./CommonGroundMark.svelte";
import SunburstMark from "./SunburstMark.svelte";
import StackedFillingsMark from "./StackedFillingsMark.svelte";
import EditorialBarsMark from "./EditorialBarsMark.svelte";
import CompositionMark from "./CompositionMark.svelte";

export interface MarkProps {
  /** Pixel size of the (square) mark. */
  size?: number;
  /**
   * Optional real data. Only the data-driven marks (filled tortilla, sunburst,
   * stacked fillings, editorial bars) react to it; the rest ignore it and keep
   * their static geometry. When omitted, each mark falls back to a default
   * dataset that reproduces the design.
   */
  data?: number[];
  /** Accessible label. When omitted the mark is decorative (aria-hidden). */
  title?: string;
}

/**
 * Coerce arbitrary input into finite, non-negative numbers so the geometric
 * marks never produce NaN coordinates (e.g. when real data contains nulls or a
 * data input is cleared). Falls back to the design default when empty.
 */
export function sanitize(data: number[] | undefined, fallback: number[]): number[] {
  const source = data && data.length ? data : fallback;
  return source.map((v) => (Number.isFinite(v) ? Math.max(0, v) : 0));
}

export interface MarkDef {
  id: string;
  /** Idea number from the design exploration ("01" … "07"), or "00" for the current mark. */
  num: string;
  name: string;
  tagline: string;
  component: Component<MarkProps>;
  /** True when the mark renders from the `data` prop using d3. */
  dataDriven: boolean;
}

export const tortillaMark = TortillaMark;

export const marks: MarkDef[] = [
  {
    id: "tortilla",
    num: "00",
    name: "Tortilla (current)",
    tagline: "The existing ellipse-with-lines mark, kept for reference.",
    component: TortillaMark,
    dataDriven: false,
  },
  {
    id: "filled-tortilla",
    num: "01",
    name: "Filled tortilla",
    tagline: "Top-down six-category donut chart — the data palette as fillings.",
    component: FilledTortillaMark,
    dataDriven: true,
  },
  {
    id: "slice",
    num: "02",
    name: "The Slice",
    tagline: "One filled wedge nudged out of an outlined tortilla.",
    component: SliceMark,
    dataDriven: false,
  },
  {
    id: "common-ground",
    num: "03",
    name: "Common ground",
    tagline: "Three overlapping rings — contributors meeting in a shared view.",
    component: CommonGroundMark,
    dataDriven: false,
  },
  {
    id: "sunburst",
    num: "04",
    name: "Sunburst",
    tagline: "Concentric data-color rings — radial chart / rolled tortilla.",
    component: SunburstMark,
    dataDriven: true,
  },
  {
    id: "stacked-fillings",
    num: "05",
    name: "Stacked fillings",
    tagline: "A tortilla circle holding a stacked-bar chart inside.",
    component: StackedFillingsMark,
    dataDriven: true,
  },
  {
    id: "editorial-bars",
    num: "06",
    name: "Editorial bars",
    tagline: "Four rising columns in the data palette — pure chart mark.",
    component: EditorialBarsMark,
    dataDriven: true,
  },
  {
    id: "composition",
    num: "07",
    name: "Composition",
    tagline: "An asymmetric tile grid — the dashboard you just composed.",
    component: CompositionMark,
    dataDriven: false,
  },
];
