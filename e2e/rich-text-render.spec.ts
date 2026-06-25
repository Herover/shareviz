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
    name: "highlight (background color)",
    delta: {
      ops: [{ insert: "marked", attributes: { background: "#ffff00" } }, { insert: " ok" }],
    },
  },
  {
    name: "text color",
    delta: { ops: [{ insert: "red", attributes: { color: "#ff0000" } }] },
  },
  {
    name: "bold + highlight combined",
    delta: { ops: [{ insert: "x", attributes: { bold: true, background: "#00ff00" } }] },
  },
  {
    name: "link run followed by plain",
    delta: {
      ops: [{ insert: "site", attributes: { link: "https://example.com" } }, { insert: " ok" }],
    },
  },
  {
    name: "bold + link combined",
    delta: { ops: [{ insert: "x", attributes: { bold: true, link: "https://example.com" } }] },
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

  for (const { command, attr } of [
    { command: "foreColor", attr: "color" },
    { command: "hiliteColor", attr: "background" },
  ] as const) {
    test(`toolbar color command sets mark: ${attr}`, async ({ page }) => {
      await page.goto("/");
      const result = await page.evaluate<RichText, [string, string]>(
        async ([url, c]) => {
          const { applyColorCommand } = await import(/* @vite-ignore */ url);
          return applyColorCommand("Word", c, "#ff8800");
        },
        [fixtureUrl, command],
      );
      expect(result.ops).toEqual([
        { insert: "Word", attributes: { [attr]: "#ff8800" } },
        { insert: "\n", attributes: { block: "p" } },
      ]);
    });
  }

  test("toolbar link command sets the link mark", async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate<RichText, [string, string]>(
      async ([url, link]) => {
        const { applyLinkCommand } = await import(/* @vite-ignore */ url);
        return applyLinkCommand("Word", link);
      },
      [fixtureUrl, "https://example.com"],
    );
    expect(result.ops).toEqual([
      { insert: "Word", attributes: { link: "https://example.com" } },
      { insert: "\n", attributes: { block: "p" } },
    ]);
  });

  test("editing a link from a collapsed caret rewrites its href without inserting text", async ({
    page,
  }) => {
    await page.goto("/");
    const result = await page.evaluate<
      { found: boolean; ops: RichText["ops"] },
      [string, RichText, string]
    >(
      async ([url, line, newUrl]) => {
        const { editLinkAtCaret } = await import(/* @vite-ignore */ url);
        return editLinkAtCaret(line, newUrl);
      },
      [
        fixtureUrl,
        {
          ops: [
            { insert: "site", attributes: { link: "https://old.example.com" } },
            { insert: "\n", attributes: { block: "p" } },
          ],
        },
        "https://new.example.com",
      ],
    );
    // The real selectEnclosingAnchor must report the caret is inside the link, and editing must
    // rewrite the href on the same single run — no inserted URL text.
    expect(result.found).toBe(true);
    expect(result.ops).toEqual([
      { insert: "site", attributes: { link: "https://new.example.com" } },
      { insert: "\n", attributes: { block: "p" } },
    ]);
  });

  test("a collapsed caret in plain text is not treated as inside a link", async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate<
      { found: boolean; ops: RichText["ops"] },
      [string, RichText, string]
    >(
      async ([url, line, newUrl]) => {
        const { editLinkAtCaret } = await import(/* @vite-ignore */ url);
        return editLinkAtCaret(line, newUrl);
      },
      [
        fixtureUrl,
        { ops: [{ insert: "site" }, { insert: "\n", attributes: { block: "p" } }] },
        "https://new.example.com",
      ],
    );
    // selectEnclosingAnchor returns false, leaving the document untouched (no link applied).
    expect(result.found).toBe(false);
    expect(result.ops).toEqual([{ insert: "site" }, { insert: "\n", attributes: { block: "p" } }]);
  });

  type Overflow = { total: number; visible: number; hasOverflow: boolean; menu: number };
  const measureFieldOverflow = (page: import("@playwright/test").Page, width: number) =>
    page.evaluate<Overflow, [string, number]>(
      async ([url, w]) => {
        const { measureFieldOverflow } = await import(/* @vite-ignore */ url);
        return measureFieldOverflow(w);
      },
      [fixtureUrl, width],
    );

  test("a wide toolbar shows every item with no overflow menu", async ({ page }) => {
    await page.goto("/");
    const r = await measureFieldOverflow(page, 1000);
    expect(r.hasOverflow).toBe(false);
    expect(r.visible).toBe(r.total);
    expect(r.total).toBeGreaterThanOrEqual(12); // 5 blocks + 7 inline marks
  });

  test("a narrow toolbar moves the items that don't fit into the overflow menu", async ({
    page,
  }) => {
    await page.goto("/");
    const wide = await measureFieldOverflow(page, 1000);
    const narrow = await measureFieldOverflow(page, 240);
    expect(narrow.hasOverflow).toBe(true);
    expect(narrow.visible).toBeGreaterThanOrEqual(1);
    expect(narrow.visible).toBeLessThan(wide.total);
    expect(narrow.menu).toBeGreaterThan(0);
    // No item is lost or duplicated: bar + menu account for the full set.
    expect(narrow.visible + narrow.menu).toBe(wide.total);
  });

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
