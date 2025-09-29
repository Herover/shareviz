// SPDX-License-Identifier: MPL-2.0

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: Awaited<ReturnType<typeof import("../server_lib/sqlite").db.getUserBySession>>;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
