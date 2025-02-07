import type { Root } from "./chart";
import type { Doc } from "sharedb/lib/client";
import * as json1 from "ot-json1";
import { formatVersion } from "./initialDoc";

/**
 * Applies operations requred to upgrade a chart specification.
 *
 * Should be able to handle migrating multiple versions, but not downgrade.
 */
export const migrate = (
  doc: /* { submitOp: (op: any) => void, data: any } */ Doc,
  toVersion: number = formatVersion,
) => {
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

  if (doc.data.m.v == 0 && doc.data.m.v < toVersion) {
    const op = [];
    if ((doc.data as Root).chart.elements.length != 0) {
      op.push([
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
      ]);
    }
    op.push([
      "m",
      "v",
      {
        r: 0,
        i: 1,
      },
    ]);

    doc.submitOp(op.length == 1 ? op[0] : op);
  }

  if (doc.data.m.v == 1 && doc.data.m.v < toVersion) {
    const op = (doc.data as Root).data.sets
      .map((e, i) => {
        return e.rows
          .filter((ee) => typeof ee.dateFormat != "string")
          .map((ee, ii) => {
            // Compute individual ops to upgrade doc
            return [
              "data",
              "sets",
              i,
              "rows",
              ii,
              "dateFormat",
              {
                i: "",
              },
            ];
          });
      })
      .flat()
      // Merge ops into a single valid op, with a op that sets the version number
      .reduce((acc, op) => json1.type.compose(acc, op), [
        "m",
        "v",
        {
          r: 0,
          i: 2,
        },
      ] as any);
    doc.submitOp(op);
  }

  if (doc.data.m.v == 2 && doc.data.m.v < toVersion) {
    const op = (doc.data as Root).chart.elements
      .reduce((acc, e, ei) => {
        if (e.type != "line") {
          return acc;
        }
        (e.d as any).repeatSettings.byKey.forEach((r: any, ri: number) => {
          acc.push([
            "chart",
            "elements",
            ei,
            "d",
            "repeatSettings",
            "byKey",
            ri,
            "allCharts",
            {
              i: false,
            },
          ]);
          acc.push([
            "chart",
            "elements",
            ei,
            "d",
            "repeatSettings",
            "byKey",
            ri,
            "ownChart",
            {
              i: true,
            },
          ]);
        });

        (e.d as any).style.byKey.forEach((s: any, si: number) => {
          acc.push([
            "chart",
            "elements",
            ei,
            "d",
            "style",
            "byKey",
            si,
            "contextColor",
            {
              i: "#000",
            },
          ]);
        });
        acc.push([
          "chart",
          "elements",
          ei,
          "d",
          "style",
          "default",
          "contextColor",
          {
            i: "#000",
          },
        ]);

        return acc;
      }, [] as any[])
      // Merge ops into a single valid op, with a op that sets the version number
      .reduce((acc, op) => json1.type.compose(acc, op), [
        "m",
        "v",
        {
          r: 0,
          i: 3,
        },
      ] as any);
    console.log(op);
    doc.submitOp(op);
  }
};
