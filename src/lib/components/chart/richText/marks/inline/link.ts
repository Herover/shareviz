// SPDX-License-Identifier: MPL-2.0

import type { InlineMark } from "./types";

// "link" is the Quill attribute key; the value is the destination URL (sanitized by `safeUrl`).
const link: InlineMark = {
  attr: "link",
  link: { command: "createLink", remove: "unlink" },
  button: { label: "🔗", title: "Link" },
};

export default link;
