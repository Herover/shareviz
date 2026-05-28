// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "vitest";
import { migrate } from "./chartMigrate";
import { createLocalDoc } from "./localShareDBDoc";

test("no datasets", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: { sets: [] },
      m: { v: 6 },
    },
    noStorage: true,
  });

  migrate(doc, 7);

  expect(doc.data).toEqual({
    data: { sets: [] },
    m: { v: 7 },
  });
});

test("dataset with transposes gets new date format fields", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: {
        sets: [
          {
            transpose: [
              { from: [], toKey: "", toValue: "", keyType: "text", valueType: "number" },
              { from: [], toKey: "y", toValue: "v", keyType: "date", valueType: "number" },
            ],
          },
        ],
      },
      m: { v: 6 },
    },
    noStorage: true,
  });

  migrate(doc, 7);

  expect(doc.data).toEqual({
    data: {
      sets: [
        {
          transpose: [
            {
              from: [],
              toKey: "",
              toValue: "",
              keyType: "text",
              valueType: "number",
              keyDateFormat: "",
              valueDateFormat: "",
            },
            {
              from: [],
              toKey: "y",
              toValue: "v",
              keyType: "date",
              valueType: "number",
              keyDateFormat: "",
              valueDateFormat: "",
            },
          ],
        },
      ],
    },
    m: { v: 7 },
  });
});

test("already migrated transpose is left untouched", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: {
        sets: [
          {
            transpose: [
              {
                from: ["2024"],
                toKey: "year",
                toValue: "v",
                keyType: "date",
                valueType: "number",
                keyDateFormat: "YYYY",
                valueDateFormat: "",
              },
            ],
          },
        ],
      },
      m: { v: 6 },
    },
    noStorage: true,
  });

  migrate(doc, 7);

  expect(doc.data).toEqual({
    data: {
      sets: [
        {
          transpose: [
            {
              from: ["2024"],
              toKey: "year",
              toValue: "v",
              keyType: "date",
              valueType: "number",
              keyDateFormat: "YYYY",
              valueDateFormat: "",
            },
          ],
        },
      ],
    },
    m: { v: 7 },
  });
});
