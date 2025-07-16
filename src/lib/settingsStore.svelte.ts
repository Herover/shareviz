// SPDX-License-Identifier: MPL-2.0

import { MediaQuery } from "svelte/reactivity";

export type UserSettings = {
  theme: "system" | "light" | "dark";
};

const settingsStorageKey = "user-settings";

const defaultSettings: UserSettings = {
  theme: "light",
};

const getSettings = () => {
  const settingsStr = localStorage.getItem(settingsStorageKey);
  if (typeof settingsStr == "string") {
    return JSON.parse(settingsStr);
  } else {
    // Silly-copy
    return JSON.parse(JSON.stringify(defaultSettings));
  }
};

class Settings {
  rawSettings: UserSettings = $state(getSettings());
  prefersDarkMode = new MediaQuery("prefers-color-scheme: dark", defaultSettings.theme == "dark");

  #theme: typeof defaultSettings.theme = $derived.by(() => {
    if (this.rawSettings.theme != "system") {
      return this.rawSettings.theme;
    } else {
      return this.prefersDarkMode.current ? "dark" : "light";
    }
  });

  /**
   * Call whenever something changes that needs remembering, eg. rawSettings is modified.
   */
  save() {
    localStorage.setItem(settingsStorageKey, JSON.stringify(this.rawSettings));
  }

  get theme() {
    return this.#theme;
  }

  set theme(val) {
    this.rawSettings.theme = val;

    this.save();
  }
}

export const settings = new Settings();
