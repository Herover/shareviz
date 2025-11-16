// SPDX-License-Identifier: MPL-2.0

export async function load({ locals }) {
  return {
    signedIn: typeof locals.session?.user == "object",
  };
}
