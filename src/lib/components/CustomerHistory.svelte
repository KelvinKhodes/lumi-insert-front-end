<script> 

  import { onMount } from 'svelte';
  import { 
    LoaderCircle,
    TriangleAlert, 
    ChevronLeft,
    ChevronRight

  } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js'; 
  import { useAsyncAction } from '../api/useAsyncAction.js'; 
  import { getTransactions } from '../api/transactions.js';
  import { getTransactionPayments } from '../api/transactionPayments.js';
    import { navigate } from 'svelte-routing';

  pageTitle.set('transactions');

  const transactions = useAsyncAction(getTransactions);
  const payments = useAsyncAction(getTransactionPayments); 
 
  let {
    customerId = null
  } = $props();

  const size = 10; 

  let queryPayload = $state({
    page: 0,  
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  }); 
   
  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  function load() {
    transactions.run({
      page: queryPayload.page,
      size,
      sortBy: queryPayload.sortBy,
      sortDirection: queryPayload.sortDirection, 
      customerId: customerId || undefined
    });

  }
 
  function goToPage(delta) {
    queryPayload.page = Math.max(0, queryPayload.page + delta);
    load();
  }  
  
  onMount(() => { 
    load();
  });

</script>

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
    <!-- desktop table -->
    <div class="sf-card hidden overflow-hidden md:block">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr class="border-b border-hairline text-[11.5px] uppercase tracking-wide text-ink-secondary">
            <th class="px-4 py-2.5 font-medium">Invoice ID</th>
            <th class="px-4 py-2.5 font-medium">Total Items</th>
            <th class="px-4 py-2.5 font-medium">Fee</th>
            <th class="px-4 py-2.5 font-medium">Discount</th>
            <th class="px-4 py-2.5 font-medium">Subtotal</th>
            <th class="px-4 py-2.5 font-medium">Grandtotal</th>
            <th class="px-4 py-2.5 font-medium">Status</th>
            <th class="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {#each $transactions.data.content as transaction (transaction.id)}  
            <tr role="button" onclick={() => navigate('/transactions/' + transaction.id)} class="border-b border-hairline last:border-0 hover:bg-black/[0.015]" >
              <td class="px-4 py-2.5 font-medium text-ink">{transaction.invoiceId}</td>
              <td class="px-4 py-2.5 font-medium text-ink">{transaction.totalItems}</td>
              <td class="px-4 py-2.5 font-medium text-ink">{currency.format(transaction.totalFee)}</td>
              <td class="px-4 py-2.5 font-medium text-ink">{currency.format(transaction.totalDiscount)}</td>
              <td class="px-4 py-2.5 font-medium text-ink">{currency.format(transaction.subTotal)}</td>
              <td class="px-4 py-2.5 font-medium text-ink">{currency.format(transaction.grandTotal)}</td>
              <td class="px-4 py-2.5 font-medium text-ink">{transaction.status}</td>
            </tr> 
          {/each}
        </tbody>
      </table>
    </div>

    <!-- mobile cards -->
    <!-- <div class="flex flex-col gap-2.5 md:hidden">
      {#each $transactions.data.content as transaction (transaction.id)}
        <div class="sf-card p-3.5">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate text-[13.5px] font-medium text-ink">{transaction.name}</p>
              <p class="text-[12px] text-ink-secondary">{transaction.category?.name ?? 'Uncategorized'}</p>
            </div>
            <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium {transaction.isActive ? 'bg-success-soft text-success' : 'bg-black/[0.06] text-ink-secondary'}">
              {transaction.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div class="mt-2.5 flex items-center justify-between text-[12.5px]">
            <span class="font-mono text-ink">{currency.format(transaction.sellPrice)}</span>
            <span class="font-mono {transaction.stockQuantity <= transaction.stockMinimum ? 'text-danger' : 'text-ink-secondary'}">
              {transaction.stockQuantity} in stock
            </span>
          </div>
          <div class="mt-3 flex gap-2">
            <button class="sf-btn-secondary flex-1 !py-1.5" onclick={() => openEdit(transaction)}>
              <Pencil size={13} />Edit
            </button>
            <button class="sf-btn-secondary flex-1 !py-1.5" onclick={() => onToggle(transaction)} disabled={$toggling.loading}>
              <Power size={13} class={transaction.isActive ? 'text-danger' : 'text-success'} />
              {transaction.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      {/each}
    </div> -->

    <div class="mt-4 flex items-center justify-between">
      <span class="text-[12px] text-ink-secondary">Page {queryPayload.page + 1}</span>
      <div class="flex gap-2">
        <button class="sf-btn-secondary !px-2.5" onclick={() => goToPage(-1)} disabled={$transactions.data.first}>
          <ChevronLeft size={14} />
        </button>
        <button class="sf-btn-secondary !px-2.5" onclick={() => goToPage(1)} disabled={$transactions.data.last}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  {/if}