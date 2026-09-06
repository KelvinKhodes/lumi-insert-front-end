<script>
  import { onMount } from 'svelte';
  import { LoaderCircle, TriangleAlert, ChevronLeft, ChevronRight, Funnel, FileDown } from 'lucide-svelte';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import { getSupplies, exportSuppliesHistory } from '../api/supplies.js';
  import SupplyFilterModal from './SupplyFilterModal.svelte';
  import { navigate } from 'svelte-routing';
  import { downloadBlob } from '../utils.js';

  let { supplierId = null } = $props();

  const supplies = useAsyncAction(getSupplies);
  const exportHistory = useAsyncAction(exportSuppliesHistory);
  const size = 10;
  let filters = $state({
    page: 0,
    status: '',
    minCreatedAt: '',
    maxCreatedAt: '',
    minTotalItems: '',
    maxTotalItems: '',
    minGrandTotal: '',
    maxGrandTotal: '',
    minTotalUnpaid: '',
    maxTotalUnpaid: '',
    minTotalPaid: '',
    maxTotalPaid: ''
  });
  let showFilters = $state(false);
  const currency = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  });
  const dateFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  function normalizeDateTime(value) {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 19);
  }

  function numberOrUndefined(value) {
    return value === '' || value == null ? undefined : Number(value);
  }

  function load() {
    supplies.run({
      page: filters.page,
      size,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      supplierId: supplierId || undefined,
      status: filters.status || undefined,
      minCreatedAt: normalizeDateTime(filters.minCreatedAt),
      maxCreatedAt: normalizeDateTime(filters.maxCreatedAt),
      minTotalItems: numberOrUndefined(filters.minTotalItems),
      maxTotalItems: numberOrUndefined(filters.maxTotalItems),
      minGrandTotal: numberOrUndefined(filters.minGrandTotal),
      maxGrandTotal: numberOrUndefined(filters.maxGrandTotal),
      minTotalUnpaid: numberOrUndefined(filters.minTotalUnpaid),
      maxTotalUnpaid: numberOrUndefined(filters.maxTotalUnpaid),
      minTotalPaid: numberOrUndefined(filters.minTotalPaid),
      maxTotalPaid: numberOrUndefined(filters.maxTotalPaid)
    });
  }

  function goToPage(delta) {
    filters.page = Math.max(0, filters.page + delta);
    load();
  }

  function applyFilters() {
    filters.page = 0;
    load();
    showFilters = false;
  }

  function resetFilters() {
    filters = { page: 0, status: '', minCreatedAt: '', maxCreatedAt: '', minTotalItems: '', maxTotalItems: '', minGrandTotal: '', maxGrandTotal: '', minTotalUnpaid: '', maxTotalUnpaid: '', minTotalPaid: '', maxTotalPaid: '' };
    load();
    showFilters = false;
  }

  async function exportXLSX() {
    const blob = await exportHistory.run({
      size,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      supplierId: supplierId || undefined,
      status: filters.status || undefined,
      minCreatedAt: normalizeDateTime(filters.minCreatedAt),
      maxCreatedAt: normalizeDateTime(filters.maxCreatedAt),
      minTotalItems: numberOrUndefined(filters.minTotalItems),
      maxTotalItems: numberOrUndefined(filters.maxTotalItems),
      minGrandTotal: numberOrUndefined(filters.minGrandTotal),
      maxGrandTotal: numberOrUndefined(filters.maxGrandTotal),
      minTotalUnpaid: numberOrUndefined(filters.minTotalUnpaid),
      maxTotalUnpaid: numberOrUndefined(filters.maxTotalUnpaid),
      minTotalPaid: numberOrUndefined(filters.minTotalPaid),
      maxTotalPaid: numberOrUndefined(filters.maxTotalPaid)
    });
    downloadBlob(blob, `supplier-supplies-${new Date().toISOString()}.xlsx`);
  }

  onMount(load);
</script>

<SupplyFilterModal
  open={showFilters}
  {filters}
  showSupplierId={false}
  onClose={() => (showFilters = false)}
  onApply={applyFilters}
  onReset={resetFilters}
/>

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
          <th class="px-4 py-2.5 font-medium">
            <button type="button" aria-label="Export supplier supplies as XLSX" class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]" onclick={exportXLSX} disabled={$exportHistory.loading}>
              <FileDown size={14} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Toggle supply filters" class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]" onclick={() => (showFilters = !showFilters)}>
                <Funnel size={14} aria-hidden="true" />
            </button>
          </th>
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
    <span class="text-[12px] text-ink-secondary">Page {filters.page + 1}</span>
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
