<script lang="ts">
  import { run } from "svelte/legacy";

  import "$lib/common.css";
  import { page } from "$app/stores";
  import { NotificationLevel, notifications } from "$lib/notificationStore";
  import { user } from "$lib/userStore";
  import { settings } from "$lib/settingsStore.svelte";
  interface Props {
    children?: import("svelte").Snippet;
  }

  let { children }: Props = $props();

  run(() => {
    if ($page.data.session?.user?.id != null) {
      user.update();
    }
  });

  $effect(() => {
    if (settings.theme == "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  });

  // TODO: UI
  (window as any).setTheme = (theme: typeof settings.theme) => (settings.theme = theme);
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

  :global([role="button"]) {
    cursor: pointer;
  }

  :global(body) {
    --main-bg-color: #ffffff;
    --accent-bg-color: #f0f0f0;
    --hover-bg-color: #deeefc;
    --detail-color: #aaaaaa;
    --text-primary: #000000;
    --text-secondary: #666666;

    --width-wide: 1200px;
    --spacing: 1.5em;
  }
  :global(body.dark-mode) {
    --main-bg-color: #19191d;
    --accent-bg-color: #333337;
    --hover-bg-color: #1f3447;
    --detail-color: #b7b7b7;
    --text-primary: #c2c2c2;
    --text-secondary: #949494;
    --link: #9098fd;
  }

  :global(body) {
    background-color: var(--main-bg-color);
    color: var(--text-primary);
  }
  :global(a, a:link, a:visited, a:hover, a:active) {
    color: var(--link);
  }
  :global(*) {
    box-sizing: border-box;
  }
</style>
