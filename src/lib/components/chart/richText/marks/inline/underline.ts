// SPDX-License-Identifier: MPL-2.0

import type { InlineMark } from "./types";

const underline: InlineMark = {
  attr: "underline",
  tag: "u",
  command: "underline",
  matchTags: ["U"],
  matchStyle: (s) => `${s.textDecoration} ${s.textDecorationLine}`.includes("underline"),
  button: { label: "U", title: "Underline" },
};

export default underline;
