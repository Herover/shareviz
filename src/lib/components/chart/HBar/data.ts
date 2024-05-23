import type { HBar as hBarType } from "../../../chart";
import { group } from "../../../utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatData = (componentSpec: hBarType, data: { [key: string]: any[]; }) => group(
  componentSpec.repeat,
  data[componentSpec.dataSet],
  (k, d) => ({
    k,
    d: group(componentSpec.categories, d, (k, g) => ({
      label: k,
      value: group(componentSpec.subCategories, g, (kk, gg) => {
        const sum = gg.reduce((acc, d) => acc + d[componentSpec.value], 0);
        return {
          label: kk,
          value: sum,
        };
      }),
    })),
  }),
);
