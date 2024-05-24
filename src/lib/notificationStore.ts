import { writable } from 'svelte/store';

export enum NotificationLevel {
  ERROR = "error",
}

export const notifications = (() => {
  const { subscribe, update } = writable<{ message: string, type: NotificationLevel }[]>([]);

  return {
    subscribe,
    addError: (message: string) => update(notifications => {
      notifications.push({ message, type: NotificationLevel.ERROR });
      return notifications;
    }),
    read: (i: number) => update(notifications => {
      notifications.splice(i, 1);
      return notifications;
    }),
  };
})();
