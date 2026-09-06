<script>
  import { onMount } from 'svelte';
  import { Link, navigate } from 'svelte-routing';
  import { Plus, LoaderCircle, TriangleAlert, ChevronLeft, ChevronRight, Funnel, FileDown } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { getSupplies, exportSuppliesHistory } from '../api/supplies.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import { downloadBlob } from '../utils.js';
    import { action, allowed } from '../permission.js';
    import { session } from '../stores/session.js';
    import SupplyFilterModal from './SupplyFilterModal.svelte';

  pageTitle.set('Supplies');

  const supplies = useAsyncAction(getSupplies);
  const exportHistory = useAsyncAction(exportSuppliesHistory);

  const size = 12;
  let filters = $state({ page: 0, status: '', supplierId: '', minCreatedAt: '', maxCreatedAt: '', minTotalItems: '', maxTotalItems: '', minGrandTotal: '', maxGrandTotal: '', minTotalUnpaid: '', maxTotalUnpaid: '', minTotalPaid: '', maxTotalPaid: '' });
  let showFilters = $state(false);

  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const dateFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  const statusStyle = {
    UNPAID: 'bg-warning-soft text-warning',
    COMPLETE: 'bg-success-soft text-success',
    CANCELLED: 'bg-danger-soft text-danger'
  };

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
      status: filters.status || undefined,
      supplierId: filters.supplierId || undefined,
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

  function onStatusChange() {
    filters.page = 0;
    load();
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
    filters = { page: 0, status: '', supplierId: '', minCreatedAt: '', maxCreatedAt: '', minTotalItems: '', maxTotalItems: '', minGrandTotal: '', maxGrandTotal: '', minTotalUnpaid: '', maxTotalUnpaid: '', minTotalPaid: '', maxTotalPaid: '' };
    load();
    showFilters = false;
  }

  async function exportXLSX() {
    const blob = await exportHistory.run({
      size,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      status: filters.status || undefined,
      supplierId: filters.supplierId || undefined,
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
    downloadBlob(blob, `supplies-${new Date().toISOString()}.xlsx`);
  }

  onMount(load);
</script>

<div class="p-5 md:p-7">
  <div class="mb-5 flex items-center justify-between gap-3">
    <h1 class="hidden text-[22px] font-semibold text-ink md:block">Supplies</h1>
    <div class="ml-auto flex items-center gap-2">
      <button type="button" aria-label="Export supply history as XLSX" class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]" onclick={exportXLSX} disabled={$exportHistory.loading}>
        <FileDown size={14} aria-hidden="true" />
      </button>
      <button type="button" aria-label="Toggle advanced filters" class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]" onclick={() => (showFilters = !showFilters)}>
        <Funnel size={14} aria-hidden="true" />
      </button>
      <select class="sf-input w-auto max-w-[150px]" bind:value={filters.status} onchange={onStatusChange}>
        <option value="">All statuses</option>
        <option value="UNPAID">Unpaid</option>
        <option value="COMPLETE">Complete</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      {#if allowed($session?.employee?.role, action.SuppliesWrite)}
      <button class="sf-btn-primary shrink-0" onclick={() => navigate('/supplies/new')}>
        <Plus size={14} aria-hidden="true" />New supply
      </button>
      {/if}
    </div>
  </div>

  <SupplyFilterModal open={showFilters} {filters} onClose={() => (showFilters = false)} onApply={applyFilters} onReset={resetFilters} />

  {#if $supplies.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $supplies.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$supplies.error.message}
    </div>
  {:else if !$supplies.data?.content?.length}
    <div class="sf-card flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p class="text-[13.5px] text-ink-secondary">No supply orders found.</p>
    </div>
  {:else}
    <div class="sf-card overflow-hidden">
      <ul class="divide-y divide-hairline">
        {#each $supplies.data.content as supply (supply.id)}
          <li>
            <Link
              to={`/supplies/${supply.id}`}
              class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-black/[0.015]"
            >
              <div class="min-w-0">
                <p class="truncate text-[13.5px] font-medium text-ink">{supply.invoiceId}</p>
                <p class="truncate text-[12px] text-ink-secondary">
                  {supply.supplierName ?? 'Unknown supplier'} · {dateFmt.format(new Date(supply.createdAt))}
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-3">
                <span class="theme-amount text-[13px] text-ink">{currency.format(supply.grandTotal ?? 0)}</span>
                <span class="rounded-full px-2 py-0.5 text-[11px] font-medium {statusStyle[supply.status] ?? 'bg-black/[0.06] text-ink-secondary'}">
                  {supply.status}
                </span>
              </div>
            </Link>
          </li>
        {/each}
      </ul>
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
</div>
