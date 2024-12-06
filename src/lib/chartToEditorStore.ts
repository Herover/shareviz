// Handles some communication between editor and chart
import { writable } from "svelte/store";

export const chartToEditor = (function createDB() {
  const { subscribe, set } = writable<{
    highlight: any[];
  }>({ highlight: [] });

  return {
    subscribe,
    setHighlight: (value: any[]) => {
      set({ highlight: value });
    },
  };
})();
