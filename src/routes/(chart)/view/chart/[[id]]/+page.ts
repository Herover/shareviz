// SPDX-License-Identifier: MPL-2.0

export function load({ params, url }) {
  return {
    id: params.id,
    editor: url.searchParams.has("editor"),
  };
}
