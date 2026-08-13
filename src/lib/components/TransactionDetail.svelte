<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { ArrowLeft, LoaderCircle, TriangleAlert, FileDown, Ban, RotateCcw, Wallet, Check, Trash2, PlayCircle } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { getTransaction, processTransaction, cancelTransaction, exportTransactionPdf } from '../api/transactions.js';
  import {
    getTransactionItems,
    addTransactionItem,
    updateTransactionItemQuantity,
    deleteTransactionItem,
    refundTransactionItem
  } from '../api/transactionItems.js';
  import { getTransactionPayments, createTransactionPayment } from '../api/transactionPayments.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import { downloadBlob } from '../utils.js';
  import ProductPicker from './ProductPicker.svelte';

  export let id;

  const transaction = useAsyncAction(getTransaction);
  const items = useAsyncAction(getTransactionItems);
  const payments = useAsyncAction(getTransactionPayments);
  const adding = useAsyncAction(addTransactionItem);
  const updatingQty = useAsyncAction(updateTransactionItemQuantity);
  const deleting = useAsyncAction(deleteTransactionItem);
  const refunding = useAsyncAction(refundTransactionItem);
  const processing = useAsyncAction(processTransaction);
  const cancelling = useAsyncAction(cancelTransaction);
  const exporting = useAsyncAction(exportTransactionPdf);
  const paying = useAsyncAction(createTransactionPayment);

  let paymentFrom = '';
  let paymentTo = '';
  let paymentAmount = '';
  let paymentFiles = null;
  let showPaymentForm = false;

  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  const statusStyle = {
    PENDING: 'bg-black/[0.06] text-ink-secondary',
    PROCESS: 'bg-warning-soft text-warning',
    COMPLETE: 'bg-success-soft text-success',
    CANCELLED: 'bg-danger-soft text-danger'
  };

  function load() {
    transaction.run(id);
    items.run(id, { size: 100 });
    payments.run(id, { size: 20 });
  }

  async function onAddItem(product) {
    await adding.run(id, { productId: product.id, quantity: 1 });
    load();
  }

  async function onQuantityChange(item, quantity) {
    if (Number(quantity) < 1) return;
    await updatingQty.run(id, item.id, Number(quantity));
    load();
  }

  async function onDeleteItem(item) {
    await deleting.run(id, item.id);
    load();
  }

  async function onRefundItem(item) {
    const qty = prompt(`Refund how many units of "${item.productName}"? (max ${item.quantity})`);
    if (!qty || Number(qty) <= 0) return;
    await refunding.run(id, item.id, { productId: item.productId, quantity: Number(qty) });
    load();
  }

  async function onProcess() {
    if (!confirm('Process this transaction? Items can no longer be edited afterwards.')) return;
    await processing.run(id);
    load();
  }

  async function onCancel() {
    if (!confirm('Cancel this transaction? This cannot be undone.')) return;
    await cancelling.run(id);
    load();
  }

  async function onExport() {
    const blob = await exporting.run(id);
    downloadBlob(blob, `transaction-${$transaction.data?.invoiceId ?? id}.pdf`);
  }

  async function onSubmitPayment() {
    if (!paymentFiles?.length) return;
    try {
      await paying.run(id, { paymentFrom, paymentTo, totalPayment: Number(paymentAmount), files: Array.from(paymentFiles) });
      paymentFrom = '';
      paymentTo = '';
      paymentAmount = '';
      paymentFiles = null;
      showPaymentForm = false;
      load();
    } catch {
      // error state already surfaced via $paying.error below
    }
  }

  onMount(load);
  $: pageTitle.set($transaction.data?.invoiceId ? `Transaction · ${$transaction.data.invoiceId}` : 'Transaction');
  $: isEditable = $transaction.data?.status === 'PENDING';
</script>

<div class="p-5 md:p-7">
  <button class="mb-4 flex items-center gap-1 text-[13px] text-ink-secondary hover:text-ink" on:click={() => navigate('/transactions')}>
    <ArrowLeft size={14} />Back to transactions
  </button>

  {#if $transaction.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $transaction.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$transaction.error.message}
    </div>
  {:else if $transaction.data}
    {@const t = $transaction.data}
    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-[20px] font-semibold text-ink">{t.invoiceId ?? 'Draft transaction'}</h1>
          <span class="rounded-full px-2 py-0.5 text-[11px] font-medium {statusStyle[t.status] ?? 'bg-black/[0.06] text-ink-secondary'}">{t.status}</span>
        </div>
        <p class="mt-0.5 text-[13px] text-ink-secondary">{t.customerName}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="sf-btn-secondary" on:click={onExport} disabled={$exporting.loading}>
          {#if $exporting.loading}<LoaderCircle size={14} class="animate-spin" />{:else}<FileDown size={14} />{/if}
          Export PDF
        </button>
        {#if isEditable}
          <button class="sf-btn-primary" on:click={onProcess} disabled={$processing.loading || !$items.data?.content?.length}>
            {#if $processing.loading}<LoaderCircle size={14} class="animate-spin" />{:else}<PlayCircle size={14} />{/if}
            Process
          </button>
          <button class="sf-btn-secondary text-danger" on:click={onCancel} disabled={$cancelling.loading}>
            <Ban size={14} />Cancel
          </button>
        {/if}
      </div>
    </div>

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div class="flex flex-col gap-4 lg:col-span-2">
        <div class="sf-card p-4">
          <h2 class="mb-3 text-[13.5px] font-semibold text-ink">Items</h2>

          {#if isEditable}
            <ProductPicker onSelect={onAddItem} placeholder="Search a product to add…" />
          {/if}

          {#if $items.loading}
            <div class="flex justify-center py-6"><LoaderCircle size={16} class="animate-spin text-ink-tertiary" /></div>
          {:else if !$items.data?.content?.length}
            <p class="mt-3 text-[12.5px] text-ink-secondary">No items yet — search above to add products.</p>
          {:else}
            <div class="mt-3 flex flex-col divide-y divide-hairline">
              {#each $items.data.content as item (item.id)}
                <div class="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-medium text-ink">{item.productName}</p>
                    <p class="text-[11.5px] text-ink-secondary">{currency.format(item.price)}</p>
                  </div>

                  {#if isEditable}
                    <input
                      class="sf-input w-16 !py-1 text-center text-[12.5px]"
                      type="number"
                      min="1"
                      value={item.quantity}
                      on:change={(e) => onQuantityChange(item, e.currentTarget.value)}
                    />
                  {:else}
                    <span class="font-mono text-ink-secondary">×{item.quantity}</span>
                  {/if}

                  <span class="w-24 shrink-0 text-right font-mono text-ink">{currency.format(item.price * item.quantity)}</span>

                  {#if isEditable}
                    <button class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05] hover:text-danger" on:click={() => onDeleteItem(item)} aria-label="Remove">
                      <Trash2 size={14} />
                    </button>
                  {:else if t.status === 'COMPLETE'}
                    <button class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05] hover:text-danger" on:click={() => onRefundItem(item)} aria-label="Refund">
                      <RotateCcw size={14} />
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <div class="sf-card p-4">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-[13.5px] font-semibold text-ink">Payments</h2>
            {#if t.status !== 'CANCELLED' && t.status !== 'PENDING'}
              <button class="sf-btn-secondary !py-1.5 !text-[12px]" on:click={() => (showPaymentForm = !showPaymentForm)}>
                <Wallet size={13} />Record payment
              </button>
            {/if}
          </div>

          {#if showPaymentForm}
            <div class="mb-3 flex flex-col gap-2 rounded-control bg-surface-muted p-3">
              {#if $paying.error}<p class="text-[12px] text-danger">{$paying.error.message}</p>{/if}
              <div class="grid grid-cols-2 gap-2">
                <input class="sf-input !py-1.5 text-[12.5px]" type="text" placeholder="From" bind:value={paymentFrom} />
                <input class="sf-input !py-1.5 text-[12.5px]" type="text" placeholder="To" bind:value={paymentTo} />
              </div>
              <input class="sf-input !py-1.5 text-[12.5px]" type="number" placeholder="Amount" bind:value={paymentAmount} />
              <input type="file" accept="image/*,application/pdf" multiple class="sf-input !py-1.5 text-[12px]" on:change={(e) => (paymentFiles = e.currentTarget.files)} />
              <button class="sf-btn-primary !py-1.5" on:click={onSubmitPayment} disabled={$paying.loading}>
                {#if $paying.loading}<LoaderCircle size={13} class="animate-spin" />{:else}<Check size={13} />{/if}
                Save payment
              </button>
            </div>
          {/if}

          {#if $payments.loading}
            <div class="flex justify-center py-6"><LoaderCircle size={16} class="animate-spin text-ink-tertiary" /></div>
          {:else if !$payments.data?.content?.length}
            <p class="py-3 text-center text-[12.5px] text-ink-secondary">No payments recorded yet.</p>
          {:else}
            <div class="flex flex-col divide-y divide-hairline">
              {#each $payments.data.content as payment (payment.id)}
                <div class="flex items-center justify-between py-2 text-[13px]">
                  <span class="text-ink-secondary">{payment.paymentFrom} → {payment.paymentTo}</span>
                  <span class="font-mono {payment.isForRefund ? 'text-danger' : 'text-success'}">
                    {payment.isForRefund ? '-' : '+'}{currency.format(payment.totalPayment)}
                  </span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <div class="sf-card flex flex-col gap-2 p-4 text-[13px]">
        <h2 class="mb-1 text-[13.5px] font-semibold text-ink">Summary</h2>
        <div class="flex justify-between text-ink-secondary"><span>Subtotal</span><span class="font-mono">{currency.format(t.subTotal)}</span></div>
        <div class="flex justify-between text-ink-secondary"><span>Fee</span><span class="font-mono">{currency.format(t.totalFee)}</span></div>
        <div class="flex justify-between text-ink-secondary"><span>Discount</span><span class="font-mono">-{currency.format(t.totalDiscount)}</span></div>
        <div class="flex justify-between border-t border-hairline pt-2 font-semibold text-ink"><span>Grand total</span><span class="font-mono">{currency.format(t.grandTotal)}</span></div>
        <div class="mt-2 flex justify-between text-success"><span>Paid</span><span class="font-mono">{currency.format(t.totalPaid)}</span></div>
        <div class="flex justify-between text-danger"><span>Unpaid</span><span class="font-mono">{currency.format(t.totalUnpaid)}</span></div>
        {#if t.totalRefunded > 0}
          <div class="flex justify-between text-ink-secondary"><span>Refunded</span><span class="font-mono">{currency.format(t.totalRefunded)}</span></div>
        {/if}
      </div>
    </div>
  {/if}
</div>
