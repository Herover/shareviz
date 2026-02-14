// SPDX-License-Identifier: MPL-2.0

import type { ComputedData } from "$lib/data";
import type { RangeElement } from ".";
import { group, negativeOneToInf } from "../../../utils";

export const formatData = (componentSpec: RangeElement, data: ComputedData) => {
  let n = 0;
  const d = group(componentSpec.repeat, data[componentSpec.dataSet]?.data ?? [], (k1, g1) => {
    const settings = componentSpec.repeatSettings.byKey.find((e) => e.k == k1);

    return {
      k: k1,
      settings,
      d: group(componentSpec.categories, g1, (k2, g2) => {
        return {
          label: componentSpec.categoryKeys.find((c) => c.k == k2)?.label.text ?? k2,
          key: k2,
          d: g2,
          value: g2
            .map((d) => ({
              v: d[componentSpec.pointValue],
              s: componentSpec.rangeCategoryKeys.find((dd) => d[componentSpec.pointLabel] == dd.k),
              // c: componentSpec.rangeCategoryKeys.find(s => s.k == d.)
            }))
            .sort(
              (a, b) =>
                negativeOneToInf(componentSpec.rangeCategoryKeys.findIndex((e) => e.k == b.s?.k)) -
                negativeOneToInf(componentSpec.rangeCategoryKeys.findIndex((e) => e.k == a.s?.k)),
            ),
          i: n++,
        };
      }).sort(
        (a, b) =>
          negativeOneToInf(componentSpec.categoryKeys.findIndex((e) => e.k == a.key)) -
          negativeOneToInf(componentSpec.categoryKeys.findIndex((e) => e.k == b.key)),
      ),
    };
  });

  return { d, n };
};
