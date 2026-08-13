<script>
  import { onMount } from 'svelte';
  import { Link } from 'svelte-routing';
  import { LoaderCircle, TriangleAlert, PackageX, Receipt, StickyNote, ChevronRight } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { session } from '../stores/session.js';
  import { getProductsByFilter } from '../api/products.js';
  import { getTransactions } from '../api/transactions.js';
  import { getMemos } from '../api/memos.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';

  pageTitle.set('Dashboard');

  const lowStock = useAsyncAction(getProductsByFilter);
  const recentTransactions = useAsyncAction(getTransactions);
  const recentMemos = useAsyncAction(getMemos);

  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const dateFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' });

  const statusStyle = {
    PENDING: 'bg-black/[0.05] text-ink-secondary',
    PROCESS: 'bg-warning-soft text-warning',
    COMPLETE: 'bg-success-soft text-success',
    CANCELLED: 'bg-danger-soft text-danger'
  };

  onMount(() => {
    lowStock.run({ sortBy: 'stockQuantity', sortDirection: 'ASC', size: 5 });
    recentTransactions.run({ sortBy: 'createdAt', sortDirection: 'DESC', size: 5 });
    recentMemos.run({});
  });
</script>

<div class="p-5 md:p-7">
  <div class="mb-6 hidden md:block">
    <h1 class="text-[22px] font-semibold text-ink">Dashboard</h1>
    <p class="mt-0.5 text-[13px] text-ink-secondary">
      Welcome back{$session?.employee?.fullname ? `, ${$session.employee.fullname}` : ''}.
    </p>
  </div>

  <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
    <!-- Low stock -->
    <section class="sf-card p-4">
      <div class="mb-3 flex items-center gap-2">
        <PackageX size={16} class="text-warning" />
        <h2 class="text-[13.5px] font-semibold text-ink">Low on stock</h2>
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
      <Link to="/products" class="mt-3 flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline">
        View all products <ChevronRight size={13} />
      </Link>
    </section>

    <!-- Recent transactions -->
    <section class="sf-card p-4">
      <div class="mb-3 flex items-center gap-2">
        <Receipt size={16} class="text-accent" />
        <h2 class="text-[13.5px] font-semibold text-ink">Recent transactions</h2>
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
            <li class="flex items-center justify-between py-2 text-[13px]">
              <div class="min-w-0">
                <p class="truncate font-medium text-ink">{tx.customerName ?? 'Walk-in customer'}</p>
                <p class="text-[11.5px] text-ink-secondary font-mono">{currency.format(tx.grandTotal ?? 0)}</p>
              </div>
              <span class="ml-3 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium {statusStyle[tx.status] ?? 'bg-black/[0.05] text-ink-secondary'}">
                {tx.status}
              </span>
            </li>
          {/each}
        </ul>
      {/if}
      <Link to="/transactions" class="mt-3 flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline">
        View all transactions <ChevronRight size={13} />
      </Link>
    </section>

    <!-- Recent memos -->
    <section class="sf-card p-4">
      <div class="mb-3 flex items-center gap-2">
        <StickyNote size={16} class="text-info" />
        <h2 class="text-[13.5px] font-semibold text-ink">Memos</h2>
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
            <li class="flex items-start gap-2 py-2 text-[13px]">
              {#if !memo.isRead}
                <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span>
              {:else}
                <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-transparent"></span>
              {/if}
              <div class="min-w-0">
                <p class="truncate font-medium text-ink">{memo.title}</p>
                <p class="truncate text-[11.5px] text-ink-secondary">{memo.body}</p>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
      <Link to="/memos" class="mt-3 flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline">
        View all memos <ChevronRight size={13} />
      </Link>
    </section>
  </div>
</div>
