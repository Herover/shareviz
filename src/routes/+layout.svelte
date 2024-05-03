<script lang="ts">
  import { NotificationLevel, notifications } from "$lib/notificationStore";
</script>

<div class="notifications">
  {#each $notifications as notification, i}
    <div
      on:click={() => notifications.read(i)}
      on:keydown={() => notifications.read(i)}
      class:error={notification.type == NotificationLevel.ERROR}
      role="button"
      class="notification"
      tabindex="0"
    >
      Error: {notification.message}
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
</style>
