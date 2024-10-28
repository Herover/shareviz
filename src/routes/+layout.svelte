<script lang="ts">
  import { NotificationLevel, notifications } from "$lib/notificationStore";
</script>

<div class="notifications">
  {#each $notifications as notification, i}
    <div
      on:click={() => notifications.read(i)}
      on:keydown={() => notifications.read(i)}
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

<slot />

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
    background-color: #ff6666;
  }
  .info {
    background-color: #70ff86;
  }

  :root {
    --main-bg-color: #ffffff;
    --accent-bg-color: #eeeeee;
    --detail-color: #aaaaaa;
    --text-secondary: #666666;
    --width-wide: 1200px;
  }
</style>
