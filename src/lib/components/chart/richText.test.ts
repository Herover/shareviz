// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "vitest";
import { Delta } from "rich-text";
import { deltaToLines, groupLines, normalizeDelta } from "./richText";

// deltaToLines / normalizeDelta are pure (no DOM); the DOM-bound renderDelta, readEditor and
// placeCaret are covered by the e2e parity/round-trip specs instead.

test("plain single line falls back to the default block", () => {
  expect(deltaToLines(new Delta([{ insert: "Hello" }]), "h1")).toEqual([
    { block: "h1", segments: [{ text: "Hello", bold: false, italic: false, underline: false }] },
  ]);
});

test("block type is read from the line-terminating newline", () => {
  const delta = new Delta([
    { insert: "Title" },
    { insert: "\n", attributes: { block: "h1" } },
    { insert: "body" },
    { insert: "\n", attributes: { block: "p" } },
  ]);
  expect(deltaToLines(delta, "p").map((l) => l.block)).toEqual(["h1", "p"]);
});

test("forced trailing newline does not produce a dangling empty line", () => {
  const delta = new Delta([{ insert: "a" }, { insert: "\n", attributes: { block: "h2" } }]);
  expect(deltaToLines(delta)).toEqual([
    { block: "h2", segments: [{ text: "a", bold: false, italic: false, underline: false }] },
  ]);
});

test("intentional blank middle line is preserved", () => {
  const delta = new Delta([
    { insert: "a" },
    { insert: "\n", attributes: { block: "h1" } },
    { insert: "\n", attributes: { block: "p" } },
    { insert: "b" },
    { insert: "\n", attributes: { block: "p" } },
  ]);
  expect(deltaToLines(delta).map((l) => ({ block: l.block, n: l.segments.length }))).toEqual([
    { block: "h1", n: 1 },
    { block: "p", n: 0 },
    { block: "p", n: 1 },
  ]);
});

test("empty delta yields one empty line at the default block", () => {
  expect(deltaToLines(new Delta([]), "h1")).toEqual([{ block: "h1", segments: [] }]);
});

test("inline formatting is carried onto segments", () => {
  const delta = new Delta([
    { insert: "x", attributes: { bold: true, underline: true } },
    { insert: "\n", attributes: { block: "p" } },
  ]);
  expect(deltaToLines(delta)[0].segments).toEqual([
    { text: "x", bold: true, italic: false, underline: true },
  ]);
});

test("normalizeDelta produces a trailing newline with an explicit block attr", () => {
  expect(normalizeDelta(new Delta([{ insert: "Hello" }]), "h1").ops).toEqual([
    { insert: "Hello" },
    { insert: "\n", attributes: { block: "h1" } },
  ]);
});

test("normalizeDelta is idempotent", () => {
  const canonical = new Delta([{ insert: "hi" }, { insert: "\n", attributes: { block: "h2" } }]);
  expect(normalizeDelta(canonical, "p").ops).toEqual(canonical.ops);
});

const listDelta = (...items: [string, "ul" | "ol" | "p"][]) =>
  new Delta(
    items.flatMap(([text, block]) => [{ insert: text }, { insert: "\n", attributes: { block } }]),
  );

test("list newlines map to ul/ol block lines", () => {
  expect(deltaToLines(listDelta(["one", "ul"], ["two", "ul"])).map((l) => l.block)).toEqual([
    "ul",
    "ul",
  ]);
});

test("groupLines collapses consecutive same-kind list lines into one group", () => {
  const groups = groupLines(deltaToLines(listDelta(["a", "ul"], ["b", "ul"])));
  expect(groups).toHaveLength(1);
  const [group] = groups;
  expect(group.list).toBe("ul");
  if (group.list) {
    expect(group.items.map((i) => i.segments[0]?.text)).toEqual(["a", "b"]);
  }
});

test("groupLines keeps adjacent ul and ol as separate lists", () => {
  const groups = groupLines(deltaToLines(listDelta(["a", "ul"], ["b", "ol"])));
  expect(groups.map((g) => g.list)).toEqual(["ul", "ol"]);
});

test("groupLines splits a list interrupted by a paragraph", () => {
  const groups = groupLines(deltaToLines(listDelta(["a", "ul"], ["mid", "p"], ["b", "ul"])));
  expect(groups.map((g) => g.list)).toEqual(["ul", null, "ul"]);
});
