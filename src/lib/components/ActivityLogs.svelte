<script>
  import { onMount } from 'svelte';
  import {
    Search,
    LoaderCircle,
    TriangleAlert,
    ChevronLeft,
    ChevronRight,
    Funnel
  } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { getActivityLogsByFilter } from '../api/activityLogs.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import ActivityLogFilterModal from './ActivityLogFilterModal.svelte';

  pageTitle.set('Activity Logs');

  const activityLogs = useAsyncAction(getActivityLogsByFilter);

  const size = 10;
  const actionOptions = [
    'LOGIN_SUCCESS',
    'LOGIN_FAILURE',
    'LOGOUT',
    'PRODUCT_CREATED',
    'PRODUCT_UPDATED',
    'PRODUCT_DELETED',
    'STOCK_ADJUSTMENT',
    'CATEGORY_CREATED',
    'CATEGORY_UPDATED',
    'CATEGORY_DELETED',
    'CUSTOMER_REGISTERED',
    'CUSTOMER_UPDATED',
    'CUSTOMER_DELETED',
    'SUPPLIER_REGISTERED',
    'SUPPLIER_UPDATED',
    'SUPPLIER_DELETED',
    'EMPLOYEE_REGISTERED',
    'EMPLOYEE_UPDATED',
    'EMPLOYEE_DELETED',
    'SUPPLY_ORDER_PLACED',
    'SUPPLY_ORDER_CANCELLED',
    'SUPPLY_ORDER_UPDATED',
    'SUPPLY_ITEM_REFUNDED',
    'SUPPLY_PAYMENT_SETTLED',
    'SUPPLY_REFUND_RECEIVED',
    'TRANSACTION_CART_CREATED',
    'TRANSACTION_ITEM_CARTED',
    'TRANSACTION_ITEM_DELETED',
    'TRANSACTION_ITEM_UPDATED',
    'TRANSACTION_ORDER_PLACED',
    'TRANSACTION_PAYMENT_RECEIVED',
    'TRANSACTION_ORDER_COMPLETED',
    'TRANSACTION_ORDER_CANCELLED',
    'TRANSACTION_REFUND_SETTLED',
    'MEMO_CREATED',
    'MEMO_UPDATED',
    'MEMO_DELETED',
    'MEMO_READ',
    'EXPORT_DATA'
  ];

  let filters = $state({
    page: 0,
    size,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    entityName: '',
    entityId: '',
    action: '',
    createdBy: '',
    minCreatedAt: '',
    maxCreatedAt: '',
    ipAddress: ''
  });

  let showFilters = $state(false);

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  function normalizeDateTime(value) {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString().slice(0, 19);
  }

  function load() {
    activityLogs.run({
      page: filters.page,
      size,
      sortBy: filters.sortBy || 'createdAt',
      sortDirection: filters.sortDirection || 'DESC',
      entityName: filters.entityName || undefined,
      entityId: filters.entityId || undefined,
      action: filters.action || undefined,
      createdBy: filters.createdBy || undefined,
      minCreatedAt: normalizeDateTime(filters.minCreatedAt),
      maxCreatedAt: normalizeDateTime(filters.maxCreatedAt),
      ipAddress: filters.ipAddress || undefined
    });
  }

  function onSearch() {
    filters.page = 0;
    load();
  }

  function applyFilters() {
    onSearch();
    showFilters = false;
  }

  function goToPage(delta) {
    filters.page = Math.max(0, filters.page + delta);
    load();
  }

  function resetFilters() {
    filters = {
      page: 0,
      size,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      entityName: '',
      entityId: '',
      action: '',
      createdBy: '',
      minCreatedAt: '',
      maxCreatedAt: '',
      ipAddress: ''
    };
    load();
    showFilters = false;
  }

  function actionLabel(action) {
    return action ? action.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : '—';
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return dateFormatter.format(date);
  }

  onMount(() => {
    load();
  });
</script>

<div class="p-5 md:p-7">
  <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <h1 class="hidden text-[22px] font-semibold text-ink md:block">Activity Logs</h1>

    <form class="flex flex-1 flex-wrap items-center gap-2 md:justify-end" onsubmit={(event) => { event.preventDefault(); onSearch(); }}>

      <button type="button" aria-label="Toggle filter" class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]" onclick={() => (showFilters = !showFilters)}>
        <Funnel size={14} aria-hidden="true" />
      </button>

      <div class="relative flex-1 md:max-w-[260px]">
        <Search size={14} class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
        <input class="sf-input pl-8" type="text" placeholder="Search by creator, entity or IP" bind:value={filters.createdBy} />
      </div>

      <button type="submit" class="sf-btn-secondary shrink-0">Search</button>
    </form>
  </div>

  <ActivityLogFilterModal
    open={showFilters}
    {filters}
    {actionOptions}
    onClose={() => (showFilters = false)}
    onApply={applyFilters}
    onReset={resetFilters}
  />

  {#if $activityLogs.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $activityLogs.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$activityLogs.error.message}
    </div>
  {:else if !$activityLogs.data?.content?.length}
    <div class="sf-card flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p class="text-[13.5px] text-ink-secondary">No activity logs found.</p>
    </div>
  {:else}
    <div class="sf-card hidden overflow-hidden md:block">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr class="border-b border-hairline text-[11.5px] uppercase tracking-wide text-ink-secondary">
            <th class="px-4 py-2.5 font-medium">Time</th>
            <th class="px-4 py-2.5 font-medium">Action</th>
            <th class="px-4 py-2.5 font-medium">Entity</th>
            <th class="px-4 py-2.5 font-medium">By</th>
            <th class="px-4 py-2.5 font-medium">IP</th>
          </tr>
        </thead>
        <tbody>
          {#each $activityLogs.data.content as log (log.id)}
            <tr class="border-b border-hairline last:border-0 hover:bg-black/[0.015]">
              <td class="px-4 py-2.5 text-ink-secondary">{formatDate(log.createdAt)}</td>
              <td class="px-4 py-2.5">
                <span class="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                  {actionLabel(log.action)}
                </span>
              </td>
              <td class="px-4 py-2.5 text-ink">
                <div class="font-medium">{log.entityName ?? '—'}</div>
                <div class="text-[11px] text-ink-secondary">{log.entityId ?? '—'}</div>
              </td>
              <td class="px-4 py-2.5 text-ink-secondary">{log.createdBy ?? '—'}</td>
              <td class="px-4 py-2.5 text-ink-secondary">{log.ipAddress ?? '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="flex flex-col gap-2.5 md:hidden">
      {#each $activityLogs.data.content as log (log.id)}
        <div class="sf-card p-3.5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                {actionLabel(log.action)}
              </span>
            </div>
            <span class="text-[11px] text-ink-secondary">{formatDate(log.createdAt)}</span>
          </div>

          <div class="mt-2 text-[13px] text-ink">
            <p class="font-medium">{log.entityName ?? 'Unknown entity'}</p>
            <p class="text-[12px] text-ink-secondary">ID: {log.entityId ?? '—'}</p>
          </div>

          <div class="mt-2.5 flex items-center justify-between text-[12px] text-ink-secondary">
            <span>{log.createdBy ?? '—'}</span>
            <span>{log.ipAddress ?? '—'}</span>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-4 flex items-center justify-between">
      <span class="text-[12px] text-ink-secondary">Page {filters.page + 1}</span>
      <div class="flex gap-2">
        <button class="sf-btn-secondary !px-2.5" onclick={() => goToPage(-1)} disabled={$activityLogs.data.first}>
          <ChevronLeft size={14} />
        </button>
        <button class="sf-btn-secondary !px-2.5" onclick={() => goToPage(1)} disabled={$activityLogs.data.last}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  {/if}
</div>
