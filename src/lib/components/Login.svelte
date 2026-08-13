<script>
  import { navigate } from 'svelte-routing';
  import { LoaderCircle, TriangleAlert } from 'lucide-svelte';
  import { login } from '../api/auth.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';

  let username = '';
  let password = '';

  const signingIn = useAsyncAction(login);

  async function onSubmit() {
    try {
      await signingIn.run({ username, password });
      navigate('/', { replace: true });
    } catch {
      // error state is already surfaced via $signingIn.error below
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center bg-canvas p-6 dark:bg-dark-canvas">
  <form on:submit|preventDefault={onSubmit} class="sf-card w-full max-w-[360px] p-8">
    <div class="mb-6 flex flex-col items-center text-center">
      <div class="mb-3 h-11 w-11 rounded-[12px] bg-accent"></div>
      <h1 class="text-[17px] font-semibold text-ink">Sign in to Lumi Insert</h1>
      <p class="mt-1 text-[13px] text-ink-secondary">Use your employee account</p>
    </div>

    {#if $signingIn.error}
      <div class="mb-4 flex items-start gap-2 rounded-control bg-danger-soft px-3 py-2 text-[12.5px] text-danger">
        <TriangleAlert size={15} class="mt-0.5 shrink-0" />
        <span>{$signingIn.error.message}</span>
      </div>
    {/if}

    <div class="mb-3">
      <label for="username" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Username</label>
      <input
        id="username"
        class="sf-input"
        type="text"
        autocomplete="username"
        bind:value={username}
        required
      />
    </div>

    <div class="mb-6">
      <label for="password" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Password</label>
      <input
        id="password"
        class="sf-input"
        type="password"
        autocomplete="current-password"
        bind:value={password}
        required
      />
    </div>

    <button type="submit" class="sf-btn-primary w-full" disabled={$signingIn.loading}>
      {#if $signingIn.loading}
        <LoaderCircle size={15} class="animate-spin" />
        Signing in…
      {:else}
        Sign in
      {/if}
    </button>
  </form>
</div>
