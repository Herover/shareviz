// SPDX-License-Identifier: MPL-2.0

export function load({ params, url, data }) {
  return {
    ...data,
    id: params.id,
    url: url.pathname,
  };
}
