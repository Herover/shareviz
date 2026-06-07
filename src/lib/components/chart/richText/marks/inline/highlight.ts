// SPDX-License-Identifier: MPL-2.0

import type { InlineMark } from "./types";

const highlight: InlineMark = {
  attr: "background",
  color: { css: "background-color", command: "hiliteColor" },
  button: { label: "H", title: "Highlight" },
};

export default highlight;
