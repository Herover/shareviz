// SPDX-License-Identifier: MPL-2.0

import type { InlineMark } from "./types";

const italic: InlineMark = {
  attr: "italic",
  tag: "em",
  command: "italic",
  matchTags: ["I", "EM"],
  matchStyle: (s) => s.fontStyle === "italic",
  button: { label: "I", title: "Italic" },
};

export default italic;
