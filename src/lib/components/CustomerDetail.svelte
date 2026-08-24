<script>
  import { run } from 'svelte/legacy';

  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { ArrowLeft, LoaderCircle, TriangleAlert, UserPen } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';  
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import { formatCurrency } from '../utils.js'; 
  import { getCustomer } from '../api/customers.js';
  import CustomerFormModal from './CustomerFormModal.svelte';
  import CustomerHistory from './CustomerHistory.svelte';
  import { action, allowed } from '../permission.js';
  import { session } from '../stores/session.js';

  let { id } = $props();

  const customer = useAsyncAction(getCustomer);
  
  let currentState = $state('GENERAL');
  let modalOpen = $state(false);
  let customerData = $state(null); 
 
  function changeState(state) {
    return () => (currentState = state);
  }

  function load() {
    customer.run(id); 
  }

  function openEdit(data) {
    customerData = data;
    modalOpen = true;
  }

  onMount(load);
  run(() => {
    pageTitle.set($customer.data?.name ? `Profile · ${$customer.data.name}` : '');
  });
</script>

<div class="p-5 md:p-7">
  <button class="mb-4 flex items-center gap-1 text-[13px] text-ink-secondary hover:text-ink" onclick={() => navigate('/customers')}>
    <ArrowLeft size={14} />Back to customers
  </button>

  {#if $customer.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $customer.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$customer.error.message}
    </div>
  {:else if $customer.data}
    {@const c = $customer.data}
    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <button class="sf-btn-primary disabled:opacity-100 opacity-50 shrink-0" disabled={currentState === 'GENERAL'} onclick={changeState('GENERAL')}>
            General
          </button>
          <button class="sf-btn-primary disabled:opacity-100 opacity-50 shrink-0" disabled={currentState === 'HISTORY'} onclick={changeState('HISTORY')}>
            History
          </button>
          <!-- <button class="sf-btn-primary disabled:opacity-100 opacity-50 shrink-0" disabled={currentState === 'GALLERY'} onclick={changeState('GALLERY')}>
            Gallery
          </button> -->
        </div> 
      </div>
    </div>
    {#if currentState === 'GENERAL'}
    <div class="sf-card p-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-[13.5px] font-semibold text-ink">General Information</h2> 
        {#if allowed($session?.employee?.role, action.CustomersWrite)}
        <button class="sf-btn-secondary !py-1.5 !text-[12px]" onclick={() => openEdit(c)}>
          <UserPen size={13} />Edit
        </button>
        {/if}
      </div>
      <div class="flex flex-col divide-y divide-hairline">
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Name</span>
          <span class="text-[13px] text-ink">{c.name}</span>
        </div>
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Status</span>
          <span class="rounded-full px-2 py-0.5 text-[11px] font-medium {c.isActive ? 'bg-green-200 text-ink-secondary' : 'bg-red-200 text-ink-secondary'}">{c.isActive ? 'Active' : 'Inactive'}</span>
        </div> 
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Email</span>
          <span class="text-[13px] text-ink">{c.email ?? '-'}</span>
        </div>
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Phone</span>
          <span class="text-[13px] text-ink">{c.contact ?? '-'}</span>
        </div>
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Address</span>
          <span class="text-[13px] text-ink">{c.shippingAddress ?? '-'}</span>
        </div>
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Transaction</span>
          <span class="text-[13px] text-ink">{c.totalTransaction ?? '-'}</span>
        </div> 
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Payment Unpaid</span>
          <span class="text-[13px] text-ink">{c.totalUnpaid != null ? formatCurrency(Number(c.totalUnpaid)) : 'Error Fetch'} (Unpaid)</span>
        </div>
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Payment Paid</span>
          <span class="text-[13px] text-ink">{c.totalPaid != null ? formatCurrency(Number(c.totalPaid)) : 'Error Fetch'} (Paid)</span>
        </div>  
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Payment Unrefunded</span>
          <span class="text-[13px] text-ink">{c.totalUnrefunded != null ? formatCurrency(Number(c.totalUnrefunded)) : 'Error Fetch'} (Unrefunded)</span>
        </div>
        <div class="flex items-center justify-between gap-3 py-2">
          <span class="text-[13px] text-ink-secondary">Payment Refunded</span>
          <span class="text-[13px] text-ink">{c.totalRefunded != null ? formatCurrency(Number(c.totalRefunded)) : 'Error Fetch'} (Refunded)</span>
        </div> 
      </div>
  </div>
  {:else if currentState === 'HISTORY'}
    <CustomerHistory customerId={c.id}/>
  <!-- {:else if currentState === 'GALLERY'}
    <div class="sf-card p-4">
      <h2 class="mb-3 text-[13.5px] font-semibold text-ink">Gallery</h2>
      <p class="text-[12.5px] text-ink-secondary">Customer gallery will be displayed here.</p>
    </div> -->
  {/if}
  {/if}
</div> 

<CustomerFormModal
  open={modalOpen}
  customer={customerData}
  onClose={() => (modalOpen = false)}
  onSaved={load}
/>
