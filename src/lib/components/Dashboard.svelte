<script>
  import { onMount } from 'svelte';
  import { Link } from 'svelte-routing';
  import { LoaderCircle, TriangleAlert, PackageX, Receipt, StickyNote, ChevronRight, TrendingUp, RotateCcw, Wallet } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { session } from '../stores/session.js';
  import { getProductsByFilter, getProductsStatistics } from '../api/products.js';
  import { getTransactions } from '../api/transactions.js';
  import { getMemos, markMemoAsRead } from '../api/memos.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import MemoViewModal from './MemoViewModal.svelte';
  import { searchGlobalTransactionsPayments } from '../api/transactionPayments.js';

  pageTitle.set('Dashboard');

  const lowStock = useAsyncAction(getProductsByFilter);
  const recentTransactions = useAsyncAction(getTransactions);
  const recentMemos = useAsyncAction(getMemos);
  const productStatistic = useAsyncAction(getProductsStatistics); 
  const recentPayments = useAsyncAction(searchGlobalTransactionsPayments);

  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const dateFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' });

  const statusStyle = {
    PENDING: 'bg-black/[0.05] text-ink-secondary',
    PROCESS: 'bg-warning-soft text-warning',
    COMPLETE: 'bg-success-soft text-success',
    CANCELLED: 'bg-danger-soft text-danger'
  };

  let memoModalOpen = $state(null);

  let period = 'TODAY';
  const periodOptions = [
    { value: 'TODAY', label: 'Today' },
    { value: 'LAST_7_DAYS', label: 'Last 7 days' },
    { value: 'LAST_30_DAYS', label: 'Last 30 days' }
  ];

  async function onOpenMemo(memo) {
    memoModalOpen = memo; 
    if (!memo.isRead) {
      try {
        await markMemoAsRead(memo.id);
        memo.isRead = true;
        recentMemos.reload($recentMemos?.data);
      } catch {
        // silently ignore — read-state is a soft signal, not worth surfacing an error for
      }
    }
  }

  function dateRangeFor(selected) {
    const now = new Date();
    const endDate = now.toISOString().replace("Z", "");
    const start = new Date(now);
 
    if (selected === 'TODAY') {
      start.setHours(0, 0, 0, 0);
    } else if (selected === 'LAST_7_DAYS') {
      start.setDate(start.getDate() - 7);
    } else {
      start.setDate(start.getDate() - 30);
    }
 
    return { startDate: start.toISOString().replace("Z", ""), endDate };
  }
 
  function loadTopStats() {
    const range = dateRangeFor(period);
    productStatistic.run({ ...range, limit: 7 }); 
  }

  function onPeriodChange() {
    loadTopStats();
  }

  onMount(() => {
    lowStock.run({ sortBy: 'stockQuantity', sortDirection: 'ASC', size: 5 });
    recentTransactions.run({ sortBy: 'createdAt', sortDirection: 'DESC', size: 5 });
    recentMemos.run({});
    loadTopStats();
    recentPayments.run({})
  });
</script>

<div class="p-5 md:p-7">

  <div class="flex flex-row justify-between items-center">
    <div class="mb-3 hidden md:block">
      <h1 class="text-[22px] font-semibold text-ink">Dashboard</h1>
      <p class="mt-0.5 text-[13px] text-ink-secondary">
        Welcome back{$session?.employee?.fullname ? `, ${$session.employee.fullname}` : ''}.
      </p>
    </div>
    <div>
      <select id="dash-period" class="sf-input p-1 pl-2 w-auto max-w-[80px] mb-3" bind:value={period} onchange={onPeriodChange}>
        {#each periodOptions as opt (opt.value)}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </div>
  </div>
  

    

  <div class="grid grid-cols-1 gap-4 lg:grid-cols-3"> 
    <section class="sf-card p-4">
      <div class="mb-3 flex items-center gap-2">
        <TrendingUp size={16} class="text-success" />
        <h2 class="text-[13.5px] font-semibold text-ink">Top selling products</h2>
      </div>
 
      {#if $productStatistic.loading}
        <div class="flex justify-center py-8"><LoaderCircle size={18} class="animate-spin text-ink-tertiary" /></div>
      {:else if $productStatistic.error}
        <p class="flex items-center gap-1.5 py-4 text-[12.5px] text-danger"><TriangleAlert size={14} />{$productStatistic.error.message}</p>
      {:else if !$productStatistic.data?.productSales.length}
        <p class="py-4 text-center text-[12.5px] text-ink-secondary">No sales in this period.</p>
      {:else}
        <ol class="flex flex-col divide-y divide-hairline">
          {#each $productStatistic.data.productSales as item, i (item.productName)}
            <li class="flex items-center gap-2.5 py-2 text-[13px]">
              <span class="w-4 shrink-0 text-[11.5px] font-medium text-ink-tertiary">{i + 1}</span>
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-ink">{item.productName}</p> 
              </div>
              <span class="shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
                {item.totalSold} sold
              </span>
            </li>
          {/each}
        </ol>
      {/if}
    </section>
 
    <!-- Top refunded products -->
    <section class="sf-card p-4">
      <div class="mb-3 flex items-center gap-2">
        <RotateCcw size={16} class="text-danger" />
        <h2 class="text-[13.5px] font-semibold text-ink">Top refunded products</h2>
      </div>
 
      {#if $productStatistic.loading}
        <div class="flex justify-center py-8"><LoaderCircle size={18} class="animate-spin text-ink-tertiary" /></div>
      {:else if $productStatistic.error}
        <p class="flex items-center gap-1.5 py-4 text-[12.5px] text-danger"><TriangleAlert size={14} />{$productStatistic.error.message}</p>
      {:else if !$productStatistic.data?.productRefunds.length}
        <p class="py-4 text-center text-[12.5px] text-ink-secondary">No refunds in this period.</p>
      {:else}
        <ol class="flex flex-col divide-y divide-hairline">
          {#each $productStatistic.data.productRefunds as item, i (item.productName)}
            <li class="flex items-center gap-2.5 py-2 text-[13px]">
              <span class="w-4 shrink-0 text-[11.5px] font-medium text-ink-tertiary">{i + 1}</span>
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-ink">{item.productName}</p> 
              </div>
              <span class="shrink-0 rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-medium text-danger">
                {item.totalRefunded} refunded
              </span>
            </li>
          {/each}
        </ol>
      {/if}
    </section>
 
    <!-- Recent memos -->
    <section class="sf-card p-4">
      <div class="mb-3 flex items-center gap-2">
        <StickyNote size={16} class="text-info" />
        <h2 class="text-[13.5px] font-semibold text-ink">Memos</h2>
        <Link to="/memos" class="ml-auto flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline">
          View all <ChevronRight size={13} />
        </Link>
      </div>

      {#if $recentMemos.loading}
        <div class="flex justify-center py-8"><LoaderCircle size={18} class="animate-spin text-ink-tertiary" /></div>
      {:else if $recentMemos.error}
        <p class="flex items-center gap-1.5 py-4 text-[12.5px] text-danger"><TriangleAlert size={14} />{$recentMemos.error.message}</p>
      {:else if !$recentMemos.data?.content?.length}
        <p class="py-4 text-center text-[12.5px] text-ink-secondary">No memos in the last month.</p>
      {:else}
        <ul class="flex flex-col divide-y divide-hairline">
          {#each $recentMemos.data?.content?.slice(0, 5) as memo (memo.id)}
            <li>
              <button 
                type="button"
                class="flex w-full items-start gap-2 rounded-md p-2 text-left text-[13px] transition-colors hover:bg-black/[0.04] focus:outline-none"
                onclick={() => onOpenMemo(memo)}
              >
              {#if !memo.isRead}
                  <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span>
                {:else}
                  <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-transparent"></span>
                {/if}
                <div class="min-w-0">
                  <p class="truncate font-medium text-ink">{memo.title}</p>
                  <p class="truncate text-[11.5px] text-ink-secondary">{memo.body}</p>
                </div>
              </button>
            </li>
          {/each}
        </ul>
      {/if} 
    </section>

    <section class="sf-card p-4">
      <div class="mb-3 flex items-center gap-2">
        <PackageX size={16} class="text-warning" />
        <h2 class="text-[13.5px] font-semibold text-ink">Low on stock</h2>
        <Link to="/products" class="ml-auto flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline">
          View all <ChevronRight size={13} />
        </Link>
      </div>

      {#if $lowStock.loading}
        <div class="flex justify-center py-8"><LoaderCircle size={18} class="animate-spin text-ink-tertiary" /></div>
      {:else if $lowStock.error}
        <p class="flex items-center gap-1.5 py-4 text-[12.5px] text-danger"><TriangleAlert size={14} />{$lowStock.error.message}</p>
      {:else if !$lowStock.data?.content?.length}
        <p class="py-4 text-center text-[12.5px] text-ink-secondary">All stock levels look healthy.</p>
      {:else}
        <ul class="flex flex-col divide-y divide-hairline">
          {#each $lowStock.data.content as product (product.id)}
            <li class="flex items-center justify-between py-2 text-[13px]">
              <div class="min-w-0">
                <p class="truncate font-medium text-ink">{product.name}</p>
                <p class="text-[11.5px] text-ink-secondary">{product.category?.name ?? 'Uncategorized'}</p>
              </div>
              <span
                class="ml-3 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium
                  {product.stockQuantity <= product.stockMinimum ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'}"
              >
                {product.stockQuantity} left
              </span>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <!-- Recent transactions -->
    <section class="sf-card p-4">
      <div class="mb-3 flex items-center gap-2">
        <Receipt size={16} class="text-accent" />
        <h2 class="text-[13.5px] font-semibold text-ink">Recent transactions</h2>
        <Link to="/transactions" class="ml-auto flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline">
          View all <ChevronRight size={13} />
        </Link>
      </div>

      {#if $recentTransactions.loading}
        <div class="flex justify-center py-8"><LoaderCircle size={18} class="animate-spin text-ink-tertiary" /></div>
      {:else if $recentTransactions.error}
        <p class="flex items-center gap-1.5 py-4 text-[12.5px] text-danger"><TriangleAlert size={14} />{$recentTransactions.error.message}</p>
      {:else if !$recentTransactions.data?.content?.length}
        <p class="py-4 text-center text-[12.5px] text-ink-secondary">No transactions yet.</p>
      {:else}
        <ul class="flex flex-col divide-y divide-hairline">
          {#each $recentTransactions.data.content as tx (tx.id)}
            <li class="text-[13px]">
              <Link to={`/transactions/${tx.id}`} class="flex items-center rounded-md transition-colors justify-between gap-3 px-4 py-2 hover:bg-black/[0.04]">
                <div class="min-w-0">
                  <p class="truncate font-medium text-ink">{tx.customerName ?? 'Walk-in customer'}</p>
                  <p class="text-[11.5px] text-ink-secondary font-mono">{tx.invoiceId}</p>
                </div>
                <div class="min-w-0">
                  <p class="text-[11.5px] text-ink-secondary font-mono">{currency.format(tx.grandTotal ?? 0)}</p>
                  <span class="ml-3 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium {statusStyle[tx.status] ?? 'bg-black/[0.05] text-ink-secondary'}">
                    {tx.status}
                  </span>
                </div>
              </Link>
            </li>
          {/each}
        </ul>
      {/if} 
    </section>
    <!-- Recent payments -->
    <section class="sf-card p-4">
      <div class="mb-3 flex items-center gap-2">
        <Wallet size={16} class="text-accent" />
        <h2 class="text-[13.5px] font-semibold text-ink">Recent payments</h2>
      </div>
 
      {#if $recentPayments.loading}
        <div class="flex justify-center py-8"><LoaderCircle size={18} class="animate-spin text-ink-tertiary" /></div>
      {:else if $recentPayments.error}
        <p class="flex items-center gap-1.5 py-4 text-[12.5px] text-danger"><TriangleAlert size={14} />{$recentPayments.error.message}</p>
      {:else if !$recentPayments.data?.content.length}
        <p class="py-4 text-center text-[12.5px] text-ink-secondary">No payments recorded yet.</p>
      {:else}
        <ul class="flex flex-col divide-y divide-hairline">
          {#each $recentPayments.data.content as payment (payment.id)}
            <li>
              <Link to={`/transactions/${payment.transactionId}`} class="flex items-center justify-between py-2 text-[13px] hover:opacity-70">
                <div class="min-w-0">
                  <p class="truncate font-medium text-ink">{payment.paymentFrom} to {payment.paymentTo}</p>
                  <p class="text-[11.5px] text-ink-secondary">{dateFmt.format(new Date(payment.createdAt))}</p>
                </div>
                <span class="ml-3 shrink-0 font-mono text-[12.5px] {payment.isForRefund ? 'text-danger' : 'text-success'}">
                  {payment.isForRefund ? '-' : '+'}{currency.format(payment.totalPayment)}
                </span>
              </Link>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </div>
</div>

<MemoViewModal open={memoModalOpen !== null} onClose={() => (memoModalOpen = null)} memo={memoModalOpen} />