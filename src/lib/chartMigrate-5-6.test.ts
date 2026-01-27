// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "vitest";
import { migrate } from "./chartMigrate";
import { createLocalDoc } from "./chartStore";

test("0", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      style: {},
      m: {
        v: 5,
      },
    },
    noStorage: true,
  });

  migrate(doc, 6);

  expect(doc.data).toEqual({
    style: { css: "" },
    m: {
      v: 6,
    },
  });
});
