import type { Line } from "../../../chart";
import { group } from "../../../utils";

export const formatData = (componentSpec: Line, data: { [key: string]: any[] }) => {
  return group(
    componentSpec.categories,
    data[componentSpec.dataSet],
    (k, g) => ({
      label: k,
      key: k,
      value: g.map((d) => ({
        x: d[componentSpec.x.key] as number | Date,
        y: d[componentSpec.y.key] as number,
      })),
    }),
  );
};
