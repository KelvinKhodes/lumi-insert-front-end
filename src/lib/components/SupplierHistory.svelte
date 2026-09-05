<script>
  import { onMount } from 'svelte';
  import { LoaderCircle, TriangleAlert, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import { getSupplies } from '../api/supplies.js';
    import { navigate } from 'svelte-routing';

  let { supplierId = null } = $props();

  const supplies = useAsyncAction(getSupplies);
  const size = 10;
  let page = $state(0);
  const currency = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  });
  const dateFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  function load() {
    supplies.run({
      page,
      size,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      supplierId: supplierId || undefined
    });
  }

  function goToPage(delta) {
    page = Math.max(0, page + delta);
    load();
  }

  onMount(load);
</script>

{#if $supplies.loading}
  <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
{:else if $supplies.error}
  <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
    <TriangleAlert size={15} />{$supplies.error.message}
  </div>
{:else if !$supplies.data?.content?.length}
  <div class="sf-card rounded-tl-none flex flex-col items-center justify-center gap-2 py-16 text-center">
    <p class="text-[13.5px] text-ink-secondary">No supplies found.</p>
  </div>
{:else}
  <div class="sf-card rounded-tl-none overflow-hidden overflow-x-auto">
    <table class="w-full text-left text-[13px]">
      <thead>
        <tr class="border-b border-hairline text-[11.5px] uppercase tracking-wide text-ink-secondary">
          <th class="px-4 py-2.5 font-medium">Invoice ID</th>
          <th class="px-4 py-2.5 font-medium">Date</th>
          <th class="px-4 py-2.5 font-medium">Items</th>
          <th class="px-4 py-2.5 font-medium">Grand total</th>
          <th class="px-4 py-2.5 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {#each $supplies.data.content as supply (supply.id)}
          <tr role="button" onclick={() => navigate('/supplies/' + supply.id)} class="border-b border-hairline last:border-0 hover:bg-black/[0.015]">
            <td class="px-4 py-2.5 font-medium text-ink">{supply.invoiceId}</td>
            <td class="px-4 py-2.5 text-ink-secondary">{dateFmt.format(new Date(supply.createdAt))}</td>
            <td class="px-4 py-2.5 text-ink-secondary">{supply.totalItems}</td>
            <td class="theme-amount px-4 py-2.5 text-ink">{currency.format(supply.grandTotal)}</td>
            <td class="px-4 py-2.5 text-ink-secondary">{supply.status}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="mt-4 flex items-center justify-between">
    <span class="text-[12px] text-ink-secondary">Page {page + 1}</span>
    <div class="flex gap-2">
      <button class="sf-btn-secondary !px-2.5" onclick={() => goToPage(-1)} disabled={$supplies.data.first}>
        <ChevronLeft size={14} />
      </button>
      <button class="sf-btn-secondary !px-2.5" onclick={() => goToPage(1)} disabled={$supplies.data.last}>
        <ChevronRight size={14} />
      </button>
    </div>
  </div>
{/if}
