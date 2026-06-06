// SPDX-License-Identifier: MPL-2.0

import type { InlineMark } from "./types";

const strike: InlineMark = {
  attr: "strike",
  tag: "s",
  command: "strikeThrough",
  matchTags: ["S", "STRIKE", "DEL"],
  matchStyle: (s) => `${s.textDecoration} ${s.textDecorationLine}`.includes("line-through"),
  button: { label: "S", title: "Strikethrough" },
};

export default strike;
