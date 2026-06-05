// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "vitest";
import { migrate } from "./chartMigrate";
import { createLocalDoc } from "./localShareDBDoc";

test("normalizes title/subtitle to block deltas (title -> h1, subtitle -> p)", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: { sets: [] },
      chart: {
        title: { ops: [{ insert: "My title" }] },
        subTitle: { ops: [{ insert: "My subtitle" }] },
      },
      m: { v: 8 },
    },
    noStorage: true,
  });

  migrate(doc, 9);

  expect(doc.data).toEqual({
    data: { sets: [] },
    chart: {
      title: { ops: [{ insert: "My title" }, { insert: "\n", attributes: { block: "h1" } }] },
      subTitle: { ops: [{ insert: "My subtitle" }, { insert: "\n", attributes: { block: "p" } }] },
    },
    m: { v: 9 },
  });
});

test("empty deltas become a single empty block line", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: { sets: [] },
      chart: { title: { ops: [] }, subTitle: { ops: [] } },
      m: { v: 8 },
    },
    noStorage: true,
  });

  migrate(doc, 9);

  expect(doc.data).toEqual({
    data: { sets: [] },
    chart: {
      title: { ops: [{ insert: "\n", attributes: { block: "h1" } }] },
      subTitle: { ops: [{ insert: "\n", attributes: { block: "p" } }] },
    },
    m: { v: 9 },
  });
});

test("multi-line title keeps per-line text and inline formatting", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: { sets: [] },
      chart: {
        title: { ops: [{ insert: "First\n" }, { insert: "Second", attributes: { bold: true } }] },
        subTitle: { ops: [] },
      },
      m: { v: 8 },
    },
    noStorage: true,
  });

  migrate(doc, 9);

  expect((doc.data as { chart: { title: { ops: unknown[] } } }).chart.title.ops).toEqual([
    { insert: "First" },
    { insert: "\n", attributes: { block: "h1" } },
    { insert: "Second", attributes: { bold: true } },
    { insert: "\n", attributes: { block: "h1" } },
  ]);
});

test("already-normalized title/subtitle are idempotent", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: { sets: [] },
      chart: {
        title: { ops: [{ insert: "hi" }, { insert: "\n", attributes: { block: "h2" } }] },
        subTitle: { ops: [{ insert: "\n", attributes: { block: "p" } }] },
      },
      m: { v: 8 },
    },
    noStorage: true,
  });

  migrate(doc, 9);

  expect(doc.data).toEqual({
    data: { sets: [] },
    chart: {
      title: { ops: [{ insert: "hi" }, { insert: "\n", attributes: { block: "h2" } }] },
      subTitle: { ops: [{ insert: "\n", attributes: { block: "p" } }] },
    },
    m: { v: 9 },
  });
});
