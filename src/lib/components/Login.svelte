<script>
  import { preventDefault } from 'svelte/legacy';
  import Logo from '../assets/Logo.png';
  import { navigate } from 'svelte-routing';
  import { LoaderCircle, TriangleAlert } from 'lucide-svelte';
  import { login } from '../api/auth.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';

  let username = $state('');
  let password = $state(''); 
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
  <form onsubmit={preventDefault(onSubmit)} class="sf-card w-full max-w-[360px] p-8">
    <div class="mb-3 flex flex-col items-center text-center">
      <div class="mb-3 h-11 w-11 rounded-[12px]">
        <img class="h-full w-full object-contain drop-shadow-[0_0px_0px_rgba(0,0,0,6)]" src={Logo} alt="Lumi Insert Logo">
      </div>
      <h1 class="text-[17px] font-semibold text-ink">Welcome Back To Lumi Insert!</h1>
      <p class="mt-1 text-[13px] text-ink-secondary">Ready to make things happen? Let's get started!</p>
    </div>

    <div class="p:mt-1 text-[13px] text-ink-secondary rounded-xl p-3 bg-gray-100/80">
      <h2 class="text-[14px] font-semibold text-ink">Hi there! Reviewing my portfolio? 👋</h2>
      <p class="font-semibold">Take a quick look below, enjoy your exploration! :D </p>
      <div class="text-[12px] mt-1">
        <p>Lumi Username: <strong>SUPERADMIN</strong></p>
        <p>Lumi Password: <strong>SUPERADMIN123!</strong></p>
        <p>Grafana: <strong>guest (username) | guest (password)</strong></p>
      </div> 
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
        placeholder="Enter your username"
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
        placeholder="Enter your password"
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
