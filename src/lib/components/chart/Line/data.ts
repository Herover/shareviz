import type { Line } from "../../../chart";
import { group } from "../../../utils";

export const formatData = (componentSpec: Line, data: { [key: string]: any[] }) => 
  group(
    componentSpec.repeat,
    data[componentSpec.dataSet],
    (k1, g1) => ({
      k: k1,
      d: group(
        componentSpec.categories,
        g1,
        (k2, g2) => ({
          label: k2,
          key: k2,
          d: g2,
          value: g2.map((d) => ({
            x: d[componentSpec.x.key] as number | Date,
            y: d[componentSpec.y.key] as number,
          })),
        }),
      ),
    }),
  );
