<script>
  import { navigate } from 'svelte-routing';
  import { ArrowLeft, LoaderCircle, TriangleAlert, ArrowRight } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { createTransaction } from '../api/transactions.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import CustomerPicker from './CustomerPicker.svelte';

  pageTitle.set('New transaction');

  const creating = useAsyncAction(createTransaction);
  let customer = $state(null);

  async function onStart() {
    if (!customer) return;
    try {
      const data = await creating.run(customer.id);
      navigate(`/transactions/${data.id}`, { replace: true });
    } catch {
      // error state already surfaced via $creating.error below
    }
  }
</script>

<div class="flex min-h-full flex-col items-center justify-center p-5 md:p-7">
  <button class="absolute left-5 top-5 flex items-center gap-1 text-[13px] text-ink-secondary hover:text-ink md:left-7 md:top-7" onclick={() => navigate('/transactions')}>
    <ArrowLeft size={14} />Back to transactions
  </button>

  <div class="sf-card w-full max-w-[380px] p-6">
    <h1 class="mb-1 text-[16px] font-semibold text-ink">Start a new transaction</h1>
    <p class="mb-4 text-[13px] text-ink-secondary">Pick a customer to open an empty cart, then add items on the next screen.</p>

    {#if $creating.error}
      <div class="mb-3 flex items-start gap-2 rounded-control bg-danger-soft px-3 py-2 text-[12.5px] text-danger">
        <TriangleAlert size={15} class="mt-0.5 shrink-0" />
        <span>{$creating.error.message}</span>
      </div>
    {/if}

    <CustomerPicker onSelect={(c) => (customer = c)} />

    <button class="sf-btn-primary mt-4 w-full" onclick={onStart} disabled={!customer || $creating.loading}>
      {#if $creating.loading}
        <LoaderCircle size={14} class="animate-spin" />
      {:else}
        <ArrowRight size={14} />
      {/if}
      Start transaction
    </button>
  </div>
</div>
