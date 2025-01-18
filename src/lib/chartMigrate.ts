import type { Root } from "./chart";
import type { Doc } from "sharedb/lib/client";

/**
 * Applies operations requred to upgrade a chart specification.
 *
 * Should be able to handle migrating multiple versions, but not downgrade.
 */
export const migrate = (doc: Doc) => {
  if (typeof doc.data.m == "undefined") {
    console.log("migrate: initial meta");

    doc.submitOp([
      [
        "m",
        {
          i: {
            v: 0,
          },
        },
      ],
      [
        "meta",
        {
          r: 0,
        },
      ],
    ]);
  }
  if (doc.data.m.v == 0) {
    const op = [
      [
        "chart",
        "elements",
        ...(doc.data as Root).chart.elements.map((_e, i) => {
          return [
            i,
            "id",
            {
              i: crypto.randomUUID(),
            },
          ];
        }),
      ],
      [
        "m",
        "v",
        {
          r: 0,
          i: 1,
        },
      ],
    ];
    doc.submitOp(op);
  }
};
