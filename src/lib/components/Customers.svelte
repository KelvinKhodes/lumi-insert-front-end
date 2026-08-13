<script>
  import { onMount } from 'svelte';
  import { Plus, Search, LoaderCircle, TriangleAlert, ChevronLeft, ChevronRight, ChevronRight as Arrow } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { getCustomers } from '../api/customers.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import CustomerFormModal from './CustomerFormModal.svelte';

  pageTitle.set('Customers');

  const customers = useAsyncAction(getCustomers);

  let page = 0;
  const size = 12;
  let nameQuery = '';
  let isActiveFilter = '';

  let modalOpen = false;
  let editingCustomerId = null;

  function load() {
    customers.run({
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
    editingCustomerId = null;
    modalOpen = true;
  }

  function openEdit(id) {
    editingCustomerId = id;
    modalOpen = true;
  }

  onMount(load);
</script>

<div class="p-5 md:p-7">
  <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <h1 class="hidden text-[22px] font-semibold text-ink md:block">Customers</h1>

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
        <Plus size={14} />New customer
      </button>
    </form>
  </div>

  {#if $customers.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $customers.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$customers.error.message}
    </div>
  {:else if !$customers.data?.content?.length}
    <div class="sf-card flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p class="text-[13.5px] text-ink-secondary">No customers found.</p>
    </div>
  {:else}
    <div class="sf-card overflow-hidden">
      <ul class="divide-y divide-hairline">
        {#each $customers.data.content as customer (customer.id)}
          <li>
            <button
              class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-black/[0.015]"
              on:click={() => openEdit(customer.id)}
            >
              <div class="flex min-w-0 items-center gap-3">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-medium text-accent">
                  {customer.name.slice(0, 2).toUpperCase()}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-[13.5px] font-medium text-ink">{customer.name}</p>
                  <p class="truncate text-[12px] text-ink-secondary">{customer.email || customer.contact}</p>
                </div>
              </div>
              <Arrow size={15} class="shrink-0 text-ink-tertiary" />
            </button>
          </li>
        {/each}
      </ul>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <span class="text-[12px] text-ink-secondary">Page {page + 1}</span>
      <div class="flex gap-2">
        <button class="sf-btn-secondary !px-2.5" on:click={() => goToPage(-1)} disabled={$customers.data.first}>
          <ChevronLeft size={14} />
        </button>
        <button class="sf-btn-secondary !px-2.5" on:click={() => goToPage(1)} disabled={$customers.data.last}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  {/if}
</div>

<CustomerFormModal
  open={modalOpen}
  customerId={editingCustomerId}
  onClose={() => (modalOpen = false)}
  onSaved={load}
/>
