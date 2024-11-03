import { writable } from "svelte/store";

import { notifications } from "./notificationStore";
import { orDefault } from "./utils";

export const user = function create() {
  const { subscribe, set } = writable<{
    teams: { teams: { id: string, name: string } }[],
    organizations: { id: string, name: string }[],
  }>({ teams: [], organizations: [] });

  const fetchLoggedIn = async () => {
    const resp = await fetch(
      "/api/user",
      {
        method: "GET",
      },
    );

    const data = await resp.json();

    if (resp.status != 200) {
      notifications.addError(orDefault(data.message, "Unknown error " + resp.statusText));
      return;
    }

    set({
      teams: data.teams,
      organizations: data.organizations,
    });
  };

  return {
    subscribe,
    update: fetchLoggedIn,
    getTeamCharts: async (teamId: string): Promise<{
      charts: { id: string, name: string, chartRef: string }[],
      members: { role: number, user: { id: string, name: string } }[],
      name: string,
    }> => {
      const resp = await fetch(
        `/api/team/${teamId}`,
        {
          method: "GET",
        },
      );

      const data = await resp.json();

      if (resp.status != 200) {
        notifications.addError(orDefault(data.message, "Unknown error " + resp.statusText));
        return { charts: [], members: [], name: "" };
      }

      return data;
    },
    geUserCharts: async (): Promise<{ id: string, name: string, chartRef: string }[]> => {
      const resp = await fetch(
        `/api/user/charts`,
        {
          method: "GET",
        },
      );

      const data = await resp.json();

      if (resp.status != 200) {
        notifications.addError(orDefault(data.message, "Unknown error " + resp.statusText));
        return [];
      }

      return data.charts;
    },
  };
}();
