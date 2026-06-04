// SPDX-License-Identifier: MPL-2.0

import path from "node:path";
import { expect, test } from "@playwright/test";
import type { RichText } from "../src/lib/chart";
import type { Rendered } from "./fixtures/richTextRender";

// The editor (`renderDelta`) and the read-only viewer (`DeltaView`) render rich text
// with deliberately different markup but must stay semantically identical, since both
// now derive their lines/runs from the shared `deltaToLines`. We render a battery of
// Deltas through both in a real browser (renderDelta needs a live DOM, DeltaView needs
// mounting) and assert their canonical line/run forms match. See the fixture for how
// the two markup models are reduced to a common form.

const CASES: { name: string; delta: RichText }[] = [
  { name: "empty", delta: { ops: [] } },
  { name: "plain text", delta: { ops: [{ insert: "Hello world" }] } },
  {
    name: "bold run followed by plain",
    delta: { ops: [{ insert: "Hello ", attributes: { bold: true } }, { insert: "world" }] },
  },
  {
    name: "all three formats on one run",
    delta: { ops: [{ insert: "x", attributes: { bold: true, italic: true, underline: true } }] },
  },
  { name: "multiple lines", delta: { ops: [{ insert: "first\nsecond\nthird" }] } },
  { name: "blank line in the middle", delta: { ops: [{ insert: "a\n\nb" }] } },
  {
    name: "formatting spanning a line break",
    delta: {
      ops: [
        { insert: "Title ", attributes: { bold: true } },
        { insert: "sub\n" },
        { insert: "under", attributes: { underline: true } },
      ],
    },
  },
];

// `/@fs/<abs>` is served by Vite (e2e is added to its fs allow-list in vite.config),
// which lets the fixture resolve its bare `svelte`/`rich-text` imports as real modules.
const fixtureUrl = `/@fs${path.resolve("e2e/fixtures/richTextRender.ts")}`;

test.describe("rich-text rendering parity", () => {
  for (const { name, delta } of CASES) {
    test(`renderDelta and DeltaView agree: ${name}`, async ({ page }) => {
      // Any page on the dev origin works; we only need Vite to serve the fixture module.
      await page.goto("/");

      const result = await page.evaluate<Rendered, [string, RichText]>(
        async ([url, d]) => {
          const { renderBoth } = await import(/* @vite-ignore */ url);
          return renderBoth(d);
        },
        [fixtureUrl, delta],
      );

      console.log(result.inline, result.blocks);
      expect(result.inline).toEqual(result.blocks);
    });
  }
});
