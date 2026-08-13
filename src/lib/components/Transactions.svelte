<script>
  import { onMount } from 'svelte';
  import { Link, navigate } from 'svelte-routing';
  import { Plus, LoaderCircle, TriangleAlert, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { getTransactions } from '../api/transactions.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';

  pageTitle.set('Transactions');

  const transactions = useAsyncAction(getTransactions);

  let page = 0;
  const size = 12;
  let statusFilter = '';

  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const dateFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  const statusStyle = {
    PENDING: 'bg-black/[0.06] text-ink-secondary',
    PROCESS: 'bg-warning-soft text-warning',
    COMPLETE: 'bg-success-soft text-success',
    CANCELLED: 'bg-danger-soft text-danger'
  };

  function load() {
    transactions.run({ page, size, sortBy: 'createdAt', sortDirection: 'DESC', status: statusFilter || undefined });
  }

  function onStatusChange() {
    page = 0;
    load();
  }

  function goToPage(delta) {
    page = Math.max(0, page + delta);
    load();
  }

  onMount(load);
</script>

<div class="p-5 md:p-7">
  <div class="mb-5 flex items-center justify-between gap-3">
    <h1 class="hidden text-[22px] font-semibold text-ink md:block">Transactions</h1>
    <div class="ml-auto flex items-center gap-2">
      <select class="sf-input w-auto max-w-[150px]" bind:value={statusFilter} on:change={onStatusChange}>
        <option value="">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="PROCESS">Process</option>
        <option value="COMPLETE">Complete</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <button class="sf-btn-primary shrink-0" on:click={() => navigate('/transactions/new')}>
        <Plus size={14} />New transaction
      </button>
    </div>
  </div>

  {#if $transactions.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $transactions.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$transactions.error.message}
    </div>
  {:else if !$transactions.data?.content?.length}
    <div class="sf-card flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p class="text-[13.5px] text-ink-secondary">No transactions found.</p>
    </div>
  {:else}
    <div class="sf-card overflow-hidden">
      <ul class="divide-y divide-hairline">
        {#each $transactions.data.content as tx (tx.id)}
          <li>
            <Link to={`/transactions/${tx.id}`} class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-black/[0.015]">
              <div class="min-w-0">
                <p class="truncate text-[13.5px] font-medium text-ink">{tx.invoiceId ?? tx.customerName}</p>
                <p class="truncate text-[12px] text-ink-secondary">{tx.customerName} · {dateFmt.format(new Date(tx.createdAt))}</p>
              </div>
              <div class="flex shrink-0 items-center gap-3">
                <span class="font-mono text-[13px] text-ink">{currency.format(tx.grandTotal ?? 0)}</span>
                <span class="rounded-full px-2 py-0.5 text-[11px] font-medium {statusStyle[tx.status] ?? 'bg-black/[0.06] text-ink-secondary'}">
                  {tx.status}
                </span>
              </div>
            </Link>
          </li>
        {/each}
      </ul>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <span class="text-[12px] text-ink-secondary">Page {page + 1}</span>
      <div class="flex gap-2">
        <button class="sf-btn-secondary !px-2.5" on:click={() => goToPage(-1)} disabled={$transactions.data.first}>
          <ChevronLeft size={14} />
        </button>
        <button class="sf-btn-secondary !px-2.5" on:click={() => goToPage(1)} disabled={$transactions.data.last}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  {/if}
</div>
