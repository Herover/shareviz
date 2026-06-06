// SPDX-License-Identifier: MPL-2.0

import type { InlineMark } from "./types";

const bold: InlineMark = {
  attr: "bold",
  tag: "strong",
  command: "bold",
  matchTags: ["B", "STRONG"],
  matchStyle: (s) => s.fontWeight === "bold" || Number(s.fontWeight) >= 700,
  button: { label: "B", title: "Bold" },
};

export default bold;
