import { dsvFormat } from "d3-dsv";
import type { Root } from "./chart";
import { valueParsers } from "./utils";

export const computeData = (chartSpec?: Root) =>
  chartSpec == null
    ? {}
    : chartSpec.data.sets.reduce(
        (acc, data) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let set = dsvFormat("\t").parse<any, string>(data.raw, (row) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.rows.reduce((acc: any, rowInfo) => {
              const parser = valueParsers[rowInfo.type];
              if (typeof parser == "undefined") {
                // TODO: better warning?
                console.warn("could not find parser", rowInfo.key);
                acc[rowInfo.key] = row[rowInfo.key];
                return acc;
              }
              acc[rowInfo.key] = parser.fn(row[rowInfo.key]);

              return acc;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }, {} as any);
          }) as any[];

          data.transpose.forEach((transpose) => {
            const set2: any[] = [];

            const valueParser = valueParsers[transpose.valueType];
            const keyParser = valueParsers[transpose.keyType];
            if (
              typeof valueParser != "undefined" &&
              typeof keyParser != "undefined"
            ) {
              // TODO
              transpose.from.forEach((key) => {
                set.forEach((row) => {
                  const row2 = {
                    ...row,
                    [transpose.toValue]: valueParser.fn(row[key]),
                    [transpose.toKey]: keyParser.fn(key),
                  };
                  set2.push(row2);
                });
              });
              set = set2;
            }
          });

          acc[data.id] = set;

          return acc;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as { [key: string]: any[] },
      );
