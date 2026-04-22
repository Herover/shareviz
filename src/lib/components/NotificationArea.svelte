<script lang="ts">
  import { NotificationLevel, notifications } from "$lib/notificationStore";
</script>

<div class="notifications">
  {#each $notifications as notification, i (i)}
    <div
      onclick={() => notifications.read(i)}
      onkeydown={() => notifications.read(i)}
      class:error={notification.type == NotificationLevel.ERROR}
      class:info={notification.type == NotificationLevel.INFO}
      role="button"
      class="notification"
      tabindex="0"
    >
      Error: {notification.message}
      {#if notification.n != 1}
        ({notification.n} times)
      {/if}
    </div>
  {/each}
</div>

<style>
  .notifications {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    z-index: 100;
  }
  .notification {
    max-width: 400px;
    margin-top: 40px;
    margin-left: auto;
    margin-right: auto;
    padding: 20px;
    border-radius: 20px;
    cursor: pointer;
  }
  .error {
    background-color: var(--state-error-bg);
    color: var(--state-error);
  }
  .info {
    background-color: #70ff86;
  }
</style>
