import type { HBar as hBarType } from "../../../chart";
import { group } from "../../../utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatData = (componentSpec: hBarType, data: { [key: string]: any[]; }) => group(
  componentSpec.repeat,
  data[componentSpec.dataSet],
  (k, d) => ({
    k,
    d: group(componentSpec.categories, d, (k, g) => {
      let last = 0;
      return {
        label: k,
        value: group(componentSpec.subCategories, g, (kk, gg) => {
          const value = gg.reduce((acc, d) => acc + d[componentSpec.value], 0);
          const from = componentSpec.stackSubCategories ? last : 0;
          const to = last + value;
          last = componentSpec.stackSubCategories ? to : 0;
          return {
            label: kk,
            value,
            from,
            to,
          };
        }),
      }
    }),
  }),
);
