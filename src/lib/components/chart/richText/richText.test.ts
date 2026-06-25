// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "vitest";
import { Delta } from "rich-text";
import {
  deltaToLines,
  groupLines,
  inlineWraps,
  normalizeDelta,
  safeColor,
  safeUrl,
} from "./richText";

// deltaToLines / normalizeDelta are pure (no DOM); the DOM-bound renderDelta, readEditor and
// placeCaret are covered by the e2e parity/round-trip specs instead.

test("plain single line falls back to the default block", () => {
  expect(deltaToLines(new Delta([{ insert: "Hello" }]), "h1")).toEqual([
    { block: "h1", segments: [{ text: "Hello", marks: {} }] },
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
  expect(deltaToLines(delta)).toEqual([{ block: "h2", segments: [{ text: "a", marks: {} }] }]);
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

test("inline marks are carried onto segments in registry order", () => {
  const delta = new Delta([
    { insert: "x", attributes: { underline: true, bold: true } },
    { insert: "\n", attributes: { block: "p" } },
  ]);
  // Marks are a map of attr → value (true for toggles), regardless of attribute order.
  expect(deltaToLines(delta)[0].segments).toEqual([
    { text: "x", marks: { bold: true, underline: true } },
  ]);
});

test("strikethrough is a first-class mark", () => {
  const delta = new Delta([
    { insert: "gone", attributes: { strike: true, bold: true } },
    { insert: "\n", attributes: { block: "p" } },
  ]);
  expect(deltaToLines(delta)[0].segments).toEqual([
    { text: "gone", marks: { bold: true, strike: true } },
  ]);
  // Round-trips back to attributes through normalizeDelta.
  expect(normalizeDelta(delta).ops[0]).toEqual({
    insert: "gone",
    attributes: { bold: true, strike: true },
  });
});

test("color marks carry a normalized color value", () => {
  const delta = new Delta([
    { insert: "x", attributes: { color: "rgb(255, 0, 0)", background: "#0F0" } },
    { insert: "\n", attributes: { block: "p" } },
  ]);
  // Values are normalized to hex by safeColor; "background"/"color" are the Quill keys.
  expect(deltaToLines(delta)[0].segments).toEqual([
    { text: "x", marks: { color: "#ff0000", background: "#00ff00" } },
  ]);
  // Invalid / transparent colors are dropped (not a mark).
  expect(
    deltaToLines(new Delta([{ insert: "y", attributes: { background: "transparent" } }]))[0]
      .segments[0].marks,
  ).toEqual({});
});

test("normalizeDelta round-trips a color value", () => {
  const delta = new Delta([{ insert: "hi", attributes: { background: "#ffff00" } }]);
  expect(normalizeDelta(delta).ops[0]).toEqual({
    insert: "hi",
    attributes: { background: "#ffff00" },
  });
});

test("safeColor normalizes valid colors and rejects invalid/transparent ones", () => {
  expect(safeColor("#abc")).toBe("#aabbcc");
  expect(safeColor("rgb(255, 0, 0)")).toBe("#ff0000");
  expect(safeColor("transparent")).toBeNull();
  expect(safeColor("not-a-color")).toBeNull();
});

test("inlineWraps orders toggle + color marks and resolves colors", () => {
  expect(inlineWraps({ bold: true, background: "#ffff00" })).toEqual([
    { tag: "strong" },
    { tag: "span", bg: "#ffff00" },
  ]);
  expect(inlineWraps({ color: "#ff0000" })).toEqual([{ tag: "span", fg: "#ff0000" }]);
});

test("safeUrl keeps safe schemes, defaults bare hosts to https, rejects dangerous ones", () => {
  // Valid destinations are returned exactly as given (no trailing-slash normalization).
  expect(safeUrl("https://example.com")).toBe("https://example.com");
  expect(safeUrl("https://example.com/page")).toBe("https://example.com/page");
  expect(safeUrl("mailto:a@b.com")).toBe("mailto:a@b.com");
  expect(safeUrl("tel:+123")).toBe("tel:+123");
  // No scheme → assumed https.
  expect(safeUrl("example.com/path")).toBe("https://example.com/path");
  // Dangerous schemes (any casing) and malformed input are rejected as null, never thrown.
  expect(safeUrl("javascript:alert(1)")).toBeNull();
  expect(safeUrl("JavaScript:alert(1)")).toBeNull();
  expect(safeUrl("data:text/html,<script>")).toBeNull();
  expect(safeUrl("java\nscript:alert(1)")).toBeNull();
  expect(safeUrl("   ")).toBeNull();
});

test("link mark carries a sanitized url value and round-trips", () => {
  const delta = new Delta([
    { insert: "site", attributes: { link: "https://example.com" } },
    { insert: "\n", attributes: { block: "p" } },
  ]);
  expect(deltaToLines(delta)[0].segments).toEqual([
    { text: "site", marks: { link: "https://example.com" } },
  ]);
  // A bare host stored without a scheme is normalized to https on read.
  expect(
    deltaToLines(new Delta([{ insert: "x", attributes: { link: "example.com" } }]))[0].segments[0]
      .marks,
  ).toEqual({ link: "https://example.com" });
  // Unsafe destinations are dropped (not a mark).
  expect(
    deltaToLines(new Delta([{ insert: "y", attributes: { link: "javascript:alert(1)" } }]))[0]
      .segments[0].marks,
  ).toEqual({});
  // Round-trips back to a link attribute through normalizeDelta.
  expect(normalizeDelta(delta).ops[0]).toEqual({
    insert: "site",
    attributes: { link: "https://example.com" },
  });
});

test("inlineWraps renders a link as an <a href> innermost (after color marks)", () => {
  expect(inlineWraps({ background: "#ffff00", link: "https://example.com" })).toEqual([
    { tag: "span", bg: "#ffff00" },
    { tag: "a", href: "https://example.com" },
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
