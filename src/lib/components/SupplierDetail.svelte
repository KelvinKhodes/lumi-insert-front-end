<script>
  import { run } from 'svelte/legacy';

  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { ArrowLeft, LoaderCircle, TriangleAlert, UserPen } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';  
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import { formatCurrency } from '../utils.js'; 
  import { getSupplier } from '../api/suppliers.js';
  import SupplierFormModal from './SupplierFormModal.svelte';
  import SupplierHistory from './SupplierHistory.svelte';
  import { action, allowed } from '../permission.js';
  import { session } from '../stores/session.js';

  let { id } = $props();

  const supplier = useAsyncAction(getSupplier);
  
  let currentState = $state('GENERAL');
  let modalOpen = $state(false);
  let supplierData = $state(null); 
 
  function changeState(state) {
    return () => (currentState = state);
  }

  function load() {
    supplier.run(id); 
  }

  function openEdit(data) {
    supplierData = data;
    modalOpen = true;
  }

  onMount(load);
  run(() => {
    pageTitle.set($supplier.data?.name ? `Supplier · ${$supplier.data.name}` : '');
  });
</script>

<div class="p-5 md:p-7">
  <button class="mb-4 flex items-center gap-1 text-[13px] text-ink-secondary hover:text-ink" onclick={() => navigate('/suppliers')}>
    <ArrowLeft size={14} />Back to suppliers
  </button>

  {#if $supplier.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $supplier.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$supplier.error.message}
    </div>
  {:else if $supplier.data}
    {@const s = $supplier.data}
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="flex items-center rounded-t-xl overflow-hidden bg-sidebar">
          <button class="sf-btn-primary rounded-none bg-[rgb(121,121,121)] hover:bg-[rgb(100,100,100)] disabled:opacity-100 opacity-50 shrink-0" disabled={currentState === 'GENERAL'} onclick={changeState('GENERAL')}>
            General
          </button>
          <button class="sf-btn-primary rounded-none bg-[rgb(121,121,121)] hover:bg-[rgb(100,100,100)] disabled:opacity-100 opacity-50 shrink-0" disabled={currentState === 'HISTORY'} onclick={changeState('HISTORY')}>
            History
          </button>
          <!-- <button class="sf-btn-primary disabled:opacity-100 opacity-50 shrink-0" disabled={currentState === 'GALLERY'} onclick={changeState('GALLERY')}>
            Gallery
          </button> -->
        </div> 
      </div>
    </div>
    {#if currentState === 'GENERAL'}
    <div class="sf-card rounded-tl-none p-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-[13.5px] font-semibold text-ink">General Information</h2> 
        {#if allowed($session?.employee?.role, action.SuppliersWrite)}
        <button class="sf-btn-secondary !py-1.5 !text-[12px]" onclick={() => openEdit(s)}>
          <UserPen size={13} />Edit
        </button>
        {/if}
      </div>
      <div class="flex flex-col divide-y divide-hairline">
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Name</span>
          <span class="text-[13px] text-ink">{s.name}</span>
        </div>
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Status</span>
          <span class="rounded-full px-2 py-0.5 text-[11px] font-medium {s.isActive ? 'bg-green-200 text-ink-secondary' : 'bg-red-200 text-ink-secondary'}">{s.isActive ? 'Active' : 'Inactive'}</span>
        </div> 
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Email</span>
          <span class="text-[13px] text-ink">{s.email ?? '-'}</span>
        </div>
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Phone</span>
          <span class="text-[13px] text-ink">{s.contact ?? '-'}</span>
        </div>
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Transactions</span>
          <span class="text-[13px] text-ink">{s.totalTransaction ?? '-'}</span>
        </div>
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Payment Unpaid</span>
          <span class="text-[13px] text-ink">{s.totalUnpaid != null ? formatCurrency(Number(s.totalUnpaid)) : '-'}</span>
        </div>
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Payment Paid</span>
          <span class="text-[13px] text-ink">{s.totalPaid != null ? formatCurrency(Number(s.totalPaid)) : '-'}</span>
        </div>
      </div>
  </div>
  {:else if currentState === 'HISTORY'}
    <SupplierHistory supplierId={s.id}/>
  <!-- {:else if currentState === 'GALLERY'}
    <div class="sf-card p-4">
      <h2 class="mb-3 text-[13.5px] font-semibold text-ink">Gallery</h2>
      <p class="text-[12.5px] text-ink-secondary">Supplier gallery will be displayed here.</p>
    </div> -->
  {/if}
  {/if}
</div> 

<SupplierFormModal
  open={modalOpen}
  supplier={supplierData}
  onClose={() => (modalOpen = false)}
  onSaved={load}
/>
