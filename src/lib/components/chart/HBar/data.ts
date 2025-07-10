import type { ComputedData } from "$lib/data";
import type { HBar as hBarType } from "../../../chart";
import { group, negativeOneToInf } from "../../../utils";

export const formatData = (componentSpec: hBarType, data: ComputedData, order: { k: string }[]) =>
  group(componentSpec.repeat, data[componentSpec.dataSet]?.data || [], (k, d) => {
    return {
      k,
      d: group(componentSpec.categories, d, (k, g) => {
        let last = 0;
        const subGroups = group(componentSpec.subCategories, g, (kk, gg) => {
          const value = gg.reduce((acc, d) => acc + (d[componentSpec.value] || 0), 0);
          return {
            label: kk,
            value,
            from: 0,
            to: 0,
          };
        });
        const sum = componentSpec.portionSubCategories
          ? subGroups.reduce((acc, dd) => acc + (dd.value || 0), 0) / 100
          : 1;
        let sorted = subGroups
          .map((d) => d)
          .sort(
            (a, b) =>
              negativeOneToInf(order.findIndex((d) => d.k == a.label)) -
              negativeOneToInf(order.findIndex((d) => d.k == b.label)),
          );
        sorted = sorted.map((d) => {
          const from = componentSpec.stackSubCategories ? last : 0;
          const to = last + d.value / sum;
          last = componentSpec.stackSubCategories ? to : 0;
          return {
            label: d.label,
            value: d.value / sum,
            from,
            to,
          };
        });

        return {
          label: k,
          value: sorted,
        };
      }),
    };
  });
