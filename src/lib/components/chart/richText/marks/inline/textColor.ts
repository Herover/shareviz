// SPDX-License-Identifier: MPL-2.0

import type { InlineMark } from "./types";

const textColor: InlineMark = {
  attr: "color",
  color: { css: "color", command: "foreColor" },
  button: { label: "A", title: "Text color" },
};

export default textColor;
