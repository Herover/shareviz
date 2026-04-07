// SPDX-License-Identifier: MPL-2.0

import { dsvFormat } from "d3-dsv";
import type { Root, Row } from "./chart";
import { valueParsers, type Parser } from "./utils";
import { getLogger } from "$lib/log.js";

const logger = getLogger();

export interface ComputedData {
  [key: string]: { data: any[]; rows: Row[] };
}

export const computeData = (chartSpec?: Root) =>
  chartSpec == null
    ? {}
    : chartSpec.data.sets.reduce((acc, data) => {
        let set = dsvFormat("\t").parse<any, string>(data.raw, (row) => {
          return data.rows.reduce((acc: any, rowInfo) => {
            // Kind of fighting typescript here...
            const parser = valueParsers[rowInfo.type as keyof typeof valueParsers] as
              | Parser
              | undefined;
            if (typeof parser == "undefined") {
              // TODO: better warning?
              logger.log("could not find parser " + rowInfo.key);
              acc[rowInfo.key] = row[rowInfo.key];
              return acc;
            }
            acc[rowInfo.key] = parser.fn(row[rowInfo.key], { dateFormat: rowInfo.dateFormat });

            return acc;
          }, {} as any);
        }) as any[];

        data.transpose.forEach((transpose) => {
          const set2: any[] = [];

          const valueParser = valueParsers[transpose.valueType as keyof typeof valueParsers] as
            | Parser
            | undefined;
          const keyParser = valueParsers[transpose.keyType as keyof typeof valueParsers] as
            | Parser
            | undefined;
          if (typeof valueParser != "undefined" && typeof keyParser != "undefined") {
            // TODO
            transpose.from.forEach((key) => {
              set.forEach((row) => {
                const row2 = {
                  ...row,
                  [transpose.toValue]: valueParser.fn(row[key], {}),
                  [transpose.toKey]: keyParser.fn(key, {}),
                };
                set2.push(row2);
              });
            });
            set = set2;
          }
        });

        const rows = [...data.rows];
        data.transpose.forEach((transpose) => {
          rows.push({
            dateFormat: "",
            key: transpose.toKey,
            type: transpose.keyType,
          });
          rows.push({
            dateFormat: "",
            key: transpose.toValue,
            type: transpose.valueType,
          });
        });

        acc[data.id] = { data: set, rows };

        return acc;
      }, {} as ComputedData);
