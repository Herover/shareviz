<script lang="ts">
  import { run } from 'svelte/legacy';

  import { page } from "$app/stores";
  import { NotificationLevel, notifications } from "$lib/notificationStore";
  import { user } from "$lib/userStore";
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  run(() => {
    if ($page.data.session?.user?.id != null) {
      user.update();
    }
  });
</script>

<div class="notifications">
  {#each $notifications as notification, i}
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

{@render children?.()}

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

  :global([role=button]) {
    cursor: pointer;
  }

  :root {
    --main-bg-color: #ffffff;
    --accent-bg-color: #eeeeee;
    --detail-color: #aaaaaa;
    --text-primary: #000000;
    --text-secondary: #666666;
    --width-wide: 1200px;
  }

  :global(body) {
    background-color: var(--main-bg-color);
    color: var(--text-primary);
  }
</style>
