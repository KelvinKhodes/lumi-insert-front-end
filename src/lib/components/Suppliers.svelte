<script>
  import { onMount } from 'svelte';
  import { Plus, Search, LoaderCircle, TriangleAlert, Pencil, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { getSuppliers } from '../api/suppliers.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import SupplierFormModal from './SupplierFormModal.svelte';

  pageTitle.set('Suppliers');

  const suppliers = useAsyncAction(getSuppliers);

  let page = 0;
  const size = 10;
  let nameQuery = '';
  let isActiveFilter = '';

  let modalOpen = false;
  let editingSupplier = null;

  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  function load() {
    suppliers.run({
      page,
      size,
      sortBy: 'name',
      sortDirection: 'ASC',
      name: nameQuery || undefined,
      isActive: isActiveFilter === '' ? undefined : isActiveFilter === 'true'
    });
  }

  function onSearch() {
    page = 0;
    load();
  }

  function onStatusChange() {
    page = 0;
    load();
  }

  function goToPage(delta) {
    page = Math.max(0, page + delta);
    load();
  }

  function openCreate() {
    editingSupplier = null;
    modalOpen = true;
  }

  function openEdit(supplier) {
    editingSupplier = supplier;
    modalOpen = true;
  }

  onMount(load);
</script>

<div class="p-5 md:p-7">
  <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <h1 class="hidden text-[22px] font-semibold text-ink md:block">Suppliers</h1>

    <form on:submit|preventDefault={onSearch} class="flex flex-1 flex-wrap items-center gap-2 md:justify-end">
      <div class="relative flex-1 md:max-w-[220px]">
        <Search size={14} class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
        <input class="sf-input pl-8" type="text" placeholder="Search by name" bind:value={nameQuery} />
      </div>
      <select class="sf-input w-auto max-w-[140px]" bind:value={isActiveFilter} on:change={onStatusChange}>
        <option value="">All statuses</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
      <button type="submit" class="sf-btn-secondary shrink-0">Search</button>
      <button type="button" class="sf-btn-primary shrink-0" on:click={openCreate}>
        <Plus size={14} />New supplier
      </button>
    </form>
  </div>

  {#if $suppliers.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $suppliers.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$suppliers.error.message}
    </div>
  {:else if !$suppliers.data?.content?.length}
    <div class="sf-card flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p class="text-[13.5px] text-ink-secondary">No suppliers found.</p>
    </div>
  {:else}
    <div class="flex flex-col gap-2.5">
      {#each $suppliers.data.content as supplier (supplier.id)}
        <div class="sf-card flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="truncate text-[13.5px] font-medium text-ink">{supplier.name}</p>
              <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium {supplier.isActive ? 'bg-success-soft text-success' : 'bg-black/[0.06] text-ink-secondary'}">
                {supplier.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p class="truncate text-[12px] text-ink-secondary">{supplier.email || supplier.contact}</p>
          </div>
          <div class="flex items-center gap-4 text-[12px]">
            <div class="text-right">
              <p class="font-mono font-medium text-ink">{supplier.totalTransaction ?? 0}</p>
              <p class="text-ink-secondary">Transactions</p>
            </div>
            <div class="text-right">
              <p class="font-mono font-medium text-danger">{currency.format(supplier.totalUnpaid ?? 0)}</p>
              <p class="text-ink-secondary">Unpaid</p>
            </div>
            <button class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]" on:click={() => openEdit(supplier)} aria-label="Edit">
              <Pencil size={14} />
            </button>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-4 flex items-center justify-between">
      <span class="text-[12px] text-ink-secondary">Page {page + 1}</span>
      <div class="flex gap-2">
        <button class="sf-btn-secondary !px-2.5" on:click={() => goToPage(-1)} disabled={$suppliers.data.first}>
          <ChevronLeft size={14} />
        </button>
        <button class="sf-btn-secondary !px-2.5" on:click={() => goToPage(1)} disabled={$suppliers.data.last}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  {/if}
</div>

<SupplierFormModal open={modalOpen} supplier={editingSupplier} onClose={() => (modalOpen = false)} onSaved={load} />
