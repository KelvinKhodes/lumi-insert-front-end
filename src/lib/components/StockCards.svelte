<script>
  import { onMount } from 'svelte';
  import { Plus, LoaderCircle, TriangleAlert, ChevronRight } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { searchStockCards } from '../api/stockcards.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import StockCardFormModal from './StockCardFormModal.svelte';

  pageTitle.set('Stock cards');

  const stockCards = useAsyncAction(searchStockCards);

  let typeFilter = $state('');
  let page = $state(0);
  const size = 15;
  let modalOpen = $state(false);

  const typeStyle = {
    CUSTOMER_IN: 'bg-success-soft text-success',
    SUPPLIER_IN: 'bg-success-soft text-success',
    REPAIRED: 'bg-success-soft text-success',
    CUSTOMER_OUT: 'bg-danger-soft text-danger',
    SUPPLIER_OUT: 'bg-danger-soft text-danger',
    DEFECT: 'bg-danger-soft text-danger'
  };

  function load() {
    stockCards.run({ page, size, sortBy: 'createdAt', sortDirection: 'DESC', type: typeFilter || undefined });
  }

  function onTypeChange() {
    page = 0;
    load();
  }

  function goToPage(delta) {
    page = Math.max(0, page + delta);
    load();
  }

  const dateFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  onMount(load);
</script>

<div class="p-5 md:p-7">
  <div class="mb-5 flex items-center justify-between gap-3">
    <h1 class="hidden text-[22px] font-semibold text-ink md:block">Stock cards</h1>
    <div class="ml-auto flex items-center gap-2">
      <select class="sf-input w-auto max-w-[170px]" bind:value={typeFilter} onchange={onTypeChange}>
        <option value="">All types</option>
        <option value="CUSTOMER_IN">Customer in</option>
        <option value="CUSTOMER_OUT">Customer out</option>
        <option value="SUPPLIER_IN">Supplier in</option>
        <option value="SUPPLIER_OUT">Supplier out</option>
        <option value="DEFECT">Defect</option>
        <option value="REPAIRED">Repaired</option>
      </select>
      <button class="sf-btn-primary shrink-0" onclick={() => (modalOpen = true)}>
        <Plus size={14} />New
      </button>
    </div>
  </div>

  {#if $stockCards.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $stockCards.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$stockCards.error.message}
    </div>
  {:else if !$stockCards.data?.content?.length}
    <div class="sf-card flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p class="text-[13.5px] text-ink-secondary">No stock movements found.</p>
    </div>
  {:else}
    <div class="sf-card overflow-hidden">
      <ul class="divide-y divide-hairline">
        {#each $stockCards.data.content as card (card.id)}
          <li class="flex items-center justify-between gap-3 px-4 py-3">
            <div class="min-w-0">
              <p class="truncate text-[13.5px] font-medium text-ink">{card.productName}</p>
              <p class="truncate text-[12px] text-ink-secondary">{card.description || '—'} · {dateFmt.format(new Date(card.createdAt))}</p>
            </div>
            <div class="flex shrink-0 items-center gap-3">
              <span class="font-mono text-[12.5px] text-ink-secondary">{card.oldStock} <ChevronRight size={11} class="inline" /> {card.newStock}</span>
              <span class="rounded-full px-2 py-0.5 text-[11px] font-medium {typeStyle[card.type] ?? 'bg-black/[0.06] text-ink-secondary'}">
                {card.type.replace('_', ' ')}
              </span>
            </div>
          </li>
        {/each}
      </ul>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <span class="text-[12px] text-ink-secondary">Page {page + 1}</span>
      <div class="flex gap-2">
        <button class="sf-btn-secondary !px-2.5" onclick={() => goToPage(-1)} disabled={page === 0}>Prev</button>
        <button class="sf-btn-secondary !px-2.5" onclick={() => goToPage(1)} disabled={($stockCards.data.content?.length ?? 0) < size}>Next</button>
      </div>
    </div>
  {/if}
</div>

<StockCardFormModal open={modalOpen} onClose={() => (modalOpen = false)} onSaved={load} />
