// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "vitest";
import { migrate } from "./chartMigrate";
import { createLocalDoc } from "./localShareDBDoc";

test("converts plain-string title and subtitle into rich-text deltas", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: { sets: [] },
      chart: { title: "My title", subTitle: "My subtitle" },
      m: { v: 7 },
    },
    noStorage: true,
  });

  migrate(doc, 8);

  expect(doc.data).toEqual({
    data: { sets: [] },
    chart: {
      title: { ops: [{ insert: "My title" }] },
      subTitle: { ops: [{ insert: "My subtitle" }] },
    },
    m: { v: 8 },
  });
});

test("empty strings become empty deltas", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: { sets: [] },
      chart: { title: "", subTitle: "" },
      m: { v: 7 },
    },
    noStorage: true,
  });

  migrate(doc, 8);

  expect(doc.data).toEqual({
    data: { sets: [] },
    chart: { title: { ops: [] }, subTitle: { ops: [] } },
    m: { v: 8 },
  });
});

test("already migrated title/subtitle are left untouched", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: { sets: [] },
      chart: {
        title: { ops: [{ insert: "hello" }] },
        subTitle: { ops: [{ insert: "world" }] },
      },
      m: { v: 8 },
    },
    noStorage: true,
  });

  migrate(doc, 8);

  expect(doc.data).toEqual({
    data: { sets: [] },
    chart: {
      title: { ops: [{ insert: "hello" }] },
      subTitle: { ops: [{ insert: "world" }] },
    },
    m: { v: 8 },
  });
});
