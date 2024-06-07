import type { HBar as hBarType } from "../../../chart";
import { group } from "../../../utils";

// Used to place un-ordered items last
const negativeOneToInf = (n: number) => n == -1 ? Number.POSITIVE_INFINITY : n;

export const formatData = (componentSpec: hBarType, data: { [key: string]: any[]; }, order: { k: string }[]) => group(
  componentSpec.repeat,
  data[componentSpec.dataSet],
  (k, d) => {
    return {
      k,
      d: group(componentSpec.categories, d, (k, g) => {
        let last = 0;
        const subGroups = group(componentSpec.subCategories, g, (kk, gg) => {
          const value = gg.reduce((acc, d) => acc + d[componentSpec.value], 0);
          return {
            label: kk,
            value,
          };
        });
        let sorted = subGroups
          .map(d => d)
          .sort((a, b) =>
            negativeOneToInf(order.findIndex(d => d.k == a.label)) - negativeOneToInf(order.findIndex(d => d.k == b.label))
          );
        sorted = sorted.map(d => {
          const from = componentSpec.stackSubCategories ? last : 0;
          const to = last + d.value;
          last = componentSpec.stackSubCategories ? to : 0;
          return {
            label: d.label,
            value: d.value,
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
  },
);
