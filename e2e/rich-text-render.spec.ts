// SPDX-License-Identifier: MPL-2.0

import path from "node:path";
import { expect, test } from "@playwright/test";
import type { RichText } from "../src/lib/chart";
import type { Rendered } from "./fixtures/richTextRender";

// The editor (`renderDelta`) and the read-only viewer (`DeltaView`) both render rich text from
// the shared `deltaToLines`/mark registry — one block element per line, semantic inline tags
// (strong/em/u/s). We render a battery of Deltas through both in a real browser and assert their
// canonical block/marks forms match, and round-trip each through the editor's DOM↔Delta
// serialization to confirm it's a fixed point. See the fixture for the canonical form.

const CASES: { name: string; delta: RichText; defaultBlock?: BlockTypeName }[] = [
  { name: "plain text", delta: { ops: [{ insert: "Hello world" }] } },
  {
    name: "bold run followed by plain (one line)",
    delta: { ops: [{ insert: "Hello ", attributes: { bold: true } }, { insert: "world" }] },
  },
  {
    name: "single h1 line",
    delta: { ops: [{ insert: "Heading" }, { insert: "\n", attributes: { block: "h1" } }] },
  },
  {
    name: "mixed h1 / h2 / p blocks",
    delta: {
      ops: [
        { insert: "Title" },
        { insert: "\n", attributes: { block: "h1" } },
        { insert: "Subhead" },
        { insert: "\n", attributes: { block: "h2" } },
        { insert: "body" },
        { insert: "\n", attributes: { block: "p" } },
      ],
    },
  },
  { name: "multiple plain lines", delta: { ops: [{ insert: "first\nsecond\nthird" }] } },
  { name: "blank line in the middle", delta: { ops: [{ insert: "a\n\nb" }] } },
  {
    name: "inline formatting spanning a block break",
    delta: {
      ops: [
        { insert: "Title ", attributes: { bold: true } },
        { insert: "sub" },
        { insert: "\n", attributes: { block: "h1" } },
        { insert: "under", attributes: { underline: true } },
        { insert: "\n", attributes: { block: "p" } },
      ],
    },
  },
  {
    name: "legacy line falls back to defaultBlock (h1)",
    delta: { ops: [{ insert: "Legacy title" }] },
    defaultBlock: "h1",
  },
  {
    name: "strikethrough run followed by plain",
    delta: { ops: [{ insert: "struck", attributes: { strike: true } }, { insert: " ok" }] },
  },
  {
    name: "bold + strikethrough combined",
    delta: { ops: [{ insert: "x", attributes: { bold: true, strike: true } }] },
  },
  {
    name: "bulleted list",
    delta: {
      ops: [
        { insert: "one" },
        { insert: "\n", attributes: { block: "ul" } },
        { insert: "two" },
        { insert: "\n", attributes: { block: "ul" } },
      ],
    },
  },
  {
    name: "numbered list",
    delta: {
      ops: [
        { insert: "first" },
        { insert: "\n", attributes: { block: "ol" } },
        { insert: "second" },
        { insert: "\n", attributes: { block: "ol" } },
      ],
    },
  },
  {
    name: "list between paragraphs",
    delta: {
      ops: [
        { insert: "intro" },
        { insert: "\n", attributes: { block: "p" } },
        { insert: "a" },
        { insert: "\n", attributes: { block: "ul" } },
        { insert: "b" },
        { insert: "\n", attributes: { block: "ul" } },
        { insert: "outro" },
        { insert: "\n", attributes: { block: "p" } },
      ],
    },
  },
  {
    name: "adjacent bulleted then numbered lists",
    delta: {
      ops: [
        { insert: "bullet" },
        { insert: "\n", attributes: { block: "ul" } },
        { insert: "number" },
        { insert: "\n", attributes: { block: "ol" } },
      ],
    },
  },
  {
    name: "list item with inline bold",
    delta: {
      ops: [
        { insert: "bold", attributes: { bold: true } },
        { insert: " item" },
        { insert: "\n", attributes: { block: "ul" } },
      ],
    },
  },
];

// Local alias so the case table doesn't need to import the union from app code.
type BlockTypeName = "h1" | "h2" | "p";

// `/@fs/<abs>` is served by Vite (e2e is added to its fs allow-list in vite.config), which
// lets the fixture resolve its bare `svelte`/`rich-text` imports as real modules.
const fixtureUrl = `/@fs${path.resolve("e2e/fixtures/richTextRender.ts")}`;

test.describe("rich-text rendering parity", () => {
  for (const { name, delta, defaultBlock } of CASES) {
    test(`renderDelta and DeltaView agree: ${name}`, async ({ page }) => {
      await page.goto("/");
      const result = await page.evaluate<Rendered, [string, RichText, BlockTypeName]>(
        async ([url, d, db]) => {
          const { renderBoth } = await import(/* @vite-ignore */ url);
          return renderBoth(d, db);
        },
        [fixtureUrl, delta, defaultBlock ?? "p"],
      );
      expect(result.inline).toEqual(result.blocks);
    });

    test(`editor round-trip is stable: ${name}`, async ({ page }) => {
      await page.goto("/");
      const [first, second] = await page.evaluate<
        [RichText, RichText],
        [string, RichText, BlockTypeName]
      >(
        async ([url, d, db]) => {
          const { roundTrip } = await import(/* @vite-ignore */ url);
          return roundTrip(d, db);
        },
        [fixtureUrl, delta, defaultBlock ?? "p"],
      );
      // The serialized form is a fixed point, and always ends with a (block-attributed) newline.
      expect(second).toEqual(first);
      expect(first.ops.at(-1)).toMatchObject({ insert: expect.stringContaining("\n") });
    });
  }

  for (const block of ["h1", "h2", "p"] as const) {
    test(`toolbar formatBlock sets block type: ${block}`, async ({ page }) => {
      await page.goto("/");
      const result = await page.evaluate<RichText, [string, BlockTypeName]>(
        async ([url, b]) => {
          const { applyFormatBlock } = await import(/* @vite-ignore */ url);
          return applyFormatBlock("Hello", b);
        },
        [fixtureUrl, block],
      );
      expect(result.ops).toEqual([{ insert: "Hello" }, { insert: "\n", attributes: { block } }]);
    });
  }

  for (const block of ["ul", "ol"] as const) {
    test(`toolbar list command sets block type: ${block}`, async ({ page }) => {
      await page.goto("/");
      const result = await page.evaluate<RichText, [string, "ul" | "ol"]>(
        async ([url, b]) => {
          const { applyListCommand } = await import(/* @vite-ignore */ url);
          return applyListCommand("Item", b);
        },
        [fixtureUrl, block],
      );
      expect(result.ops).toEqual([{ insert: "Item" }, { insert: "\n", attributes: { block } }]);
    });
  }

  for (const { command, attr } of [
    { command: "bold", attr: "bold" },
    { command: "italic", attr: "italic" },
    { command: "underline", attr: "underline" },
    { command: "strikeThrough", attr: "strike" },
  ] as const) {
    test(`toolbar inline command sets mark: ${attr}`, async ({ page }) => {
      await page.goto("/");
      const result = await page.evaluate<RichText, [string, string]>(
        async ([url, c]) => {
          const { applyInlineCommand } = await import(/* @vite-ignore */ url);
          return applyInlineCommand("Word", c);
        },
        [fixtureUrl, command],
      );
      expect(result.ops).toEqual([
        { insert: "Word", attributes: { [attr]: true } },
        { insert: "\n", attributes: { block: "p" } },
      ]);
    });
  }

  test("empty input: editor renders one block, viewer renders nothing", async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate<Rendered, [string, RichText, BlockTypeName]>(
      async ([url, d, db]) => {
        const { renderBoth } = await import(/* @vite-ignore */ url);
        return renderBoth(d, db);
      },
      [fixtureUrl, { ops: [] }, "h1"],
    );
    // The contenteditable always needs a focusable line; the viewer intentionally shows nothing.
    expect(result.blocks).toEqual([{ block: "h1", segments: [] }]);
    expect(result.inline).toEqual([]);
  });
});
