// SPDX-License-Identifier: MPL-2.0

import type { ComputedData } from "$lib/data";
import type { Line, LineStyleKey } from "../../../chart";
import { group, negativeOneToInf } from "../../../utils";

const getStyle = (componentSpec: Line, k: string) => {
  const style = componentSpec.style.byKey.find((s) => s.k == k);
  if (style) return style;
  else {
    const def = {
      ...componentSpec.style.default,
      label: { ...componentSpec.style.default.label },
    };
    def.label.text = def.label.text == "" ? "" : k;

    return def;
  }
};

export const formatData = (componentSpec: Line, data: ComputedData) =>
  group(componentSpec.repeat, data[componentSpec.dataSet]?.data ?? [], (k1, g1) => {
    const settings = componentSpec.repeatSettings.byKey.find((e) => e.k == k1);

    return {
      k: k1,
      settings,
      d: group(componentSpec.categories, g1, (k2, g2) => {
        return {
          label: k2,
          key: k2,
          d: g2,
          value: g2.map((d) => ({
            x: d[componentSpec.x.key] as number | Date,
            y: d[componentSpec.y.key] as number,
          })),
        };
      })
        .sort(
          (a, b) =>
            negativeOneToInf(componentSpec.style.byKey.findIndex((e) => e.k == b.key)) -
            negativeOneToInf(componentSpec.style.byKey.findIndex((e) => e.k == a.key)),
        )
        .reduce(
          (acc, line, i) => {
            const lastLine =
              componentSpec.stack && i != 0
                ? acc[i - 1].value.map((d) => d.to)
                : line.value.map(() => 0);

            const values = group("x", line.value, (k, d) => ({ k, d }))
              .map((d, i) => {
                // Sum values if this line has multiple of the same X value, ex.
                // same year multiple times.
                const summed = d.d.reduce((acc, dd) => acc + dd.y, 0);
                return {
                  x: d.d[0].x,
                  y: summed,
                  to: summed + lastLine[i],
                  from: lastLine[i],
                };
              })
              // Split line parts into multiple if there's a NaN value
              .reduce(
                (acc2, value, i, arr) => {
                  if (Number.isNaN(value.y)) {
                    if (i != arr.length - 1 && !Number.isNaN(arr[i + 1].y)) {
                      acc2.push([]);
                    }
                  } else {
                    acc2[acc2.length - 1].push(value);
                  }

                  return acc2;
                },
                [[]] as { x: number | Date; y: number; to: number; from: number }[][],
              );

            values
              .filter((d) => d.length != 0)
              .forEach((value, i, arr) => {
                acc.push({
                  label: line.label,
                  key: line.key,
                  type: "line",
                  settings: getStyle(componentSpec, line.key),
                  value,
                });
                if (i != arr.length - 1) {
                  acc.push({
                    label: line.label,
                    key: line.key,
                    type: "missing",
                    settings: getStyle(componentSpec, line.key),
                    value: [{ ...value[value.length - 1] }, { ...arr[i + 1][0] }],
                  });
                }
              });
            return acc;
          },
          [] as {
            label: string;
            key: string;
            type: "missing" | "line";
            settings: LineStyleKey;
            value: { x: number | Date; y: number; to: number; from: number }[];
          }[],
        ),
    };
  });
