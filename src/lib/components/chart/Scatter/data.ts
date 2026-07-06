// SPDX-License-Identifier: MPL-2.0

import type { ComputedData } from "$lib/data";
import type { ScatterElement } from ".";
import { group, negativeOneToInf } from "../../../utils";

export interface ScatterPoint {
  x: number;
  y: number;
  r?: number;
  label: string;
}

export interface ScatterSegment {
  type: "line" | "missing";
  points: ScatterPoint[];
}

export type ScatterCharts = ReturnType<typeof formatData>;
export type ScatterSeries = ScatterCharts[number]["series"][number];

export const formatData = (componentSpec: ScatterElement, data: ComputedData) => {
  const sizeKey = componentSpec.radiusValue ?? "";
  const isValid = (p: ScatterPoint) =>
    typeof p.x == "number" &&
    !Number.isNaN(p.x) &&
    typeof p.y == "number" &&
    !Number.isNaN(p.y) &&
    (sizeKey == "" || (typeof p.r == "number" && !Number.isNaN(p.r)));

  // A chart for every repeat value, empty repeat means a single chart
  return group(componentSpec.repeat ?? "", data[componentSpec.dataSet]?.data ?? [], (k1, g1) => ({
    k: k1,
    settings: componentSpec.repeatSettings?.byKey.find((e) => e.k == k1),
    series: group(componentSpec.categories, g1, (k, g) => {
      // Split points into runs of valid values, a new run starts wherever
      // invalid (eg. missing/unparseable) values are dropped between valid ones
      const parts = g
        .map((d) => ({
          x: d[componentSpec.x.key] as number,
          y: d[componentSpec.y.key] as number,
          r: sizeKey == "" ? undefined : (d[sizeKey] as number),
          label: componentSpec.pointLabel == "" ? "" : "" + d[componentSpec.pointLabel],
        }))
        .reduce(
          (acc, p, i, arr) => {
            if (isValid(p)) {
              acc[acc.length - 1].push(p);
            } else if (
              i != arr.length - 1 &&
              isValid(arr[i + 1]) &&
              acc[acc.length - 1].length != 0
            ) {
              acc.push([]);
            }
            return acc;
          },
          [[]] as ScatterPoint[][],
        )
        .filter((part) => part.length != 0);

      return {
        k,
        settings: componentSpec.categoryKeys.find((c) => c.k == k),
        points: parts.flat(),
        // A solid line segment per run, with a dashed bridge over dropped values
        segments: parts.reduce((acc, part, i, arr) => {
          acc.push({ type: "line", points: part });
          if (i != arr.length - 1) {
            acc.push({
              type: "missing",
              points: [part[part.length - 1], arr[i + 1][0]],
            });
          }
          return acc;
        }, [] as ScatterSegment[]),
      };
    }).sort(
      (a, b) =>
        negativeOneToInf(componentSpec.categoryKeys.findIndex((e) => e.k == a.k)) -
        negativeOneToInf(componentSpec.categoryKeys.findIndex((e) => e.k == b.k)),
    ),
  })).sort(
    (a, b) =>
      negativeOneToInf(componentSpec.repeatSettings?.byKey.findIndex((e) => e.k == a.k) ?? -1) -
      negativeOneToInf(componentSpec.repeatSettings?.byKey.findIndex((e) => e.k == b.k) ?? -1),
  );
};
