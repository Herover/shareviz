import { writable } from 'svelte/store';

export enum NotificationLevel {
  ERROR = "error",
}

export const notifications = (() => {
  const { subscribe, update } = writable<{ message: string, type: NotificationLevel, n: number }[]>([]);

  const addNotification = (type: NotificationLevel, message: string) => {
    update(notifications => {
      const existing = notifications.find(n => n.message === message && n.type === type);
      if (existing) {
        existing.n ++;
      } else {
        notifications.push({ message, type: NotificationLevel.ERROR, n: 1 });
      }

      return notifications;
    });
  }

  return {
    subscribe,
    addError: (message: string) => addNotification(NotificationLevel.ERROR, message),
    read: (i: number) => update(notifications => {
      notifications.splice(i, 1);
      return notifications;
    }),
  };
})();
