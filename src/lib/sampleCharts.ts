// SPDX-License-Identifier: MPL-2.0

// Registry of built-in example charts. Each entry has a stable `id` used to
// link to it (see /example/[id]) and a `url` to its JSON under /static.
// Add new examples here — the login page and the /example/[id] copy route both
// read from this single list.

export interface SampleChart {
  /** Stable, unique id used in the /example/[id] link. */
  id: string;
  /** Path to the chart JSON (a serialized chart Root) under /static. */
  url: string;
}

export const sampleCharts: SampleChart[] = [
  {
    id: "minmax-prices-by-seller",
    url: "/sample-charts/tortilla-minmax-prices-by-seller.json",
  },
];

export const getSampleChart = (id: string): SampleChart | undefined =>
  sampleCharts.find((s) => s.id === id);
