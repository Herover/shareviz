import { writable } from "svelte/store";

import { notifications } from "./notificationStore";
import { orDefault } from "./utils";

export const user = function create() {
  const { subscribe, set, update } = writable<{
    signedIn: boolean,
    username: string,
    userId: string,
    teams: { id: string, name: string }[],
  }>({ signedIn: false, username: "", userId: "", teams: [] });

  const fetchLoggedIn = async () => {
    const resp = await fetch(
      "/api/user",
      {
        method: "GET",
      },
    );

    const data = await resp.json();

    if (resp.status < 200 || 299 < resp.status) {
      update(old => {
        old.signedIn = false;
        return old;
      });

      return false;
    }

    set({
      signedIn: true,
      userId: data.userId,
      username: data.username,
      teams: data.teams,
    });
  };
  fetchLoggedIn();

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

        notifications.addError(orDefault(data.message, `Unknown error with ${resp.status} ${resp.statusText}`));

        return false;
      }


      set({
        signedIn: true,
        userId: data.userId,
        username: data.username,
        teams: data.teams,
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
        notifications.addError(orDefault(data.message, `Unknown error with ${resp.status} ${resp.statusText}`));

        return false;
      }

      set({
        signedIn: false,
        userId: "",
        username: "",
        teams: [],
      });
    },
    createUser: async (username: string, password: string) => {
      const resp = await fetch(
        "/api/user",
        {
          method: "POST",
          body: JSON.stringify({ username, password }),
        },
      );

      const data = await resp.json();

      if (resp.status < 200 || 299 < resp.status) {
        notifications.addError(orDefault(data.message, `Unknown error with ${resp.status} ${resp.statusText}`));

        return false;
      }

      return true;
    }
  };
}();
