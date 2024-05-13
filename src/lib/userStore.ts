import { writable } from "svelte/store";

import { notifications } from "./notificationStore";

export const user = function create() {
  const { subscribe, set, update } = writable<{
    signedIn: boolean,
    name: string,
    userId: string,
  }>({ signedIn: false, name: "", userId: "" });

  return {
    subscribe,
    signIn: async (username: string, password: string) => {
      const resp = await fetch(
        "/api/auth",
        {
          method: "POST",
          body: JSON.stringify({ username, password }),
        },
      );

      const data = await resp.json();

      if (resp.status < 200 || 299 < resp.status) {
        update(old => {
          old.signedIn = false;
          return old;
        });

        notifications.addError(data.message || `Unknown error with ${resp.status} ${resp.statusText}`);

        return false;
      }


      set({
        signedIn: true,
        userId: data.userId,
        name: data.name,
      });
      return true;
    },
    signOut: async () => {
      const resp = await fetch(
        "/api/deauth",
        {
          method: "POST",
        },
      );

      const data = await resp.json();

      if (resp.status < 200 || 299 < resp.status) {
        notifications.addError(data.message || `Unknown error with ${resp.status} ${resp.statusText}`);

        return false;
      }

      set({
        signedIn: false,
        userId: "",
        name: "",
      });
    },
  };
}();
