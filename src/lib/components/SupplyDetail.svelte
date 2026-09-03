<script>
  import { run } from 'svelte/legacy';

  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { ArrowLeft, LoaderCircle, TriangleAlert, FileDown, Ban, RotateCcw, Wallet, Check } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { getSupply, cancelSupply, refundSupplyItem, exportSupplyPdf } from '../api/supplies.js';
  import { getSupplyPayments, createSupplyPayment, refundSupplyPayment } from '../api/supplyPayments.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import { downloadBlob } from '../utils.js';
    import { action, allowed } from '../permission.js';
    import { session } from '../stores/session.js';

  let { id } = $props();

  const supply = useAsyncAction(getSupply);
  const payments = useAsyncAction(getSupplyPayments);
  const cancelling = useAsyncAction(cancelSupply);
  const refunding = useAsyncAction(refundSupplyItem);
  const exporting = useAsyncAction(exportSupplyPdf);
  const paying = useAsyncAction(createSupplyPayment);
  const refundPaying = useAsyncAction(refundSupplyPayment);

  let paymentFrom = $state('');
  let paymentTo = $state('');
  let paymentAmount = $state('');
  let paymentFiles = $state(null);
  let showPaymentForm = $state(false);

  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const dateFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  const statusStyle = {
    UNPAID: 'bg-warning-soft text-warning',
    COMPLETE: 'bg-success-soft text-success',
    CANCELLED: 'bg-danger-soft text-danger'
  };

  function load() {
    supply.run(id);
    payments.run(id, { size: 20, sortBy: 'createdAt', sortDirection: 'DESC' });
  }

  async function onCancel() {
    if (!confirm('Cancel this supply order? This cannot be undone.')) return;
    await cancelling.run(id);
    load();
  }

  async function onRefundItem(item) {
    const qty = prompt(`Refund how many units of "${item.product.name}"? (max ${item.quantity})`);
    if (!qty || Number(qty) <= 0) return;
    await refunding.run(id, { productId: item.product.id, quantity: Number(qty) });
    load();
  }

  async function onExport() {
    const blob = await exporting.run(id);
    downloadBlob(blob, `supply-${$supply.data?.invoiceId ?? id}.pdf`);
  }

  async function onSubmitPayment() {
    if (!paymentFiles?.length) return;
    try {
      await paying.run(id, {
        paymentFrom,
        paymentTo,
        totalPayment: Number(paymentAmount),
        files: Array.from(paymentFiles)
      });
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

  async function onSubmitRefundPayment() {
    if (!paymentFiles?.length) return;
    try {
      await refundPaying.run(id, { paymentFrom, paymentTo, totalPayment: Number(paymentAmount), files: Array.from(paymentFiles) });
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
  run(() => {
    pageTitle.set($supply.data?.invoiceId ? `Supply · ${$supply.data.invoiceId}` : 'Supply');
  });
</script>

<div class="p-5 md:p-7">
  <button class="mb-4 flex items-center gap-1 text-[13px] text-ink-secondary hover:text-ink" onclick={() => navigate('/supplies')}>
    <ArrowLeft size={14} />Back to supplies
  </button>

  {#if $supply.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $supply.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$supply.error.message}
    </div>
  {:else if $supply.data}
    {@const s = $supply.data}
    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-[20px] font-semibold text-ink">{s.invoiceId}</h1>
          <span class="rounded-full px-2 py-0.5 text-[11px] font-medium {statusStyle[s.status] ?? 'bg-black/[0.06] text-ink-secondary'}">{s.status}</span>
        </div>
        <p class="mt-0.5 text-[13px] text-ink-secondary">{s.supplierName} · {dateFmt.format(new Date(s.createdAt))}</p>
      </div>
      <div class="flex gap-2">
        <button class="sf-btn-secondary" onclick={onExport} disabled={$exporting.loading}>
          {#if $exporting.loading}<LoaderCircle size={14} class="animate-spin" />{:else}<FileDown size={14} />{/if}
          Export PDF
        </button>
        {#if allowed($session?.employee?.role, action.SuppliesWrite)}
        {#if s.status !== 'CANCELLED'}
          <button class="sf-btn-secondary text-danger" onclick={onCancel} disabled={$cancelling.loading}>
            <Ban size={14} />Cancel order
          </button>
        {/if}
        {/if}
      </div>
    </div>

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div class="flex flex-col gap-4 lg:col-span-2">
        <div class="sf-card p-4">
          <h2 class="mb-3 text-[13.5px] font-semibold text-ink">Items ({s.totalItems})</h2>
          <div class="flex flex-col divide-y divide-hairline">
            {#each s.supplyItems as item (item.id)}
              <div class="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                <div class="min-w-0">
                  <p class="truncate font-medium text-ink">{item.product.name}</p>
                  <p class="text-[11.5px] text-ink-secondary">{item.quantity} × {currency.format(item.price)}</p>
                </div>
                <div class="flex shrink-0 items-center gap-3">
                  <span class="theme-amount text-ink">{currency.format(item.price * item.quantity)}</span>
                  {#if allowed($session?.employee?.role, action.SuppliesWrite)}
                  {#if s.status !== 'CANCELLED' && item.quantity > 0}
                    <button class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05] hover:text-danger" onclick={() => onRefundItem(item)} aria-label="Refund supply item">
                      <RotateCcw size={14} />
                    </button>
                  {/if}
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="sf-card p-4">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-[13.5px] font-semibold text-ink">Payments</h2>
            {#if allowed($session?.employee?.role, action.SupplyPaymentsWrite)}
            {#if  (s.totalUnpaid > 0 || s.totalUnrefunded > 0)}
              <button class="sf-btn-secondary !py-1.5 !text-[12px] {s.totalUnrefunded > 0 ? "bg-red-600 hover:bg-red-500" : ""}" onclick={() => (showPaymentForm = !showPaymentForm)}>
                <Wallet size={13} />Record {s.totalUnrefunded > 0? "refund" : "payment"}
              </button>
            {/if}
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
              <input type="file" accept="image/*,application/pdf" multiple class="sf-input !py-1.5 text-[12px]" onchange={(e) => (paymentFiles = e.currentTarget.files)} />
              <button class="sf-btn-primary !py-1.5" onclick={s.totalUnrefunded > 0? onSubmitRefundPayment : onSubmitPayment} disabled={$paying.loading}>
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
                  <span class="theme-amount {payment.isForRefund ? 'text-danger' : 'text-success'}">
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
        <div class="flex justify-between text-ink-secondary"><span>Total Items</span><span class="theme-number">{s.totalItems}</span></div>
        <div class="flex justify-between text-ink-secondary"><span>Subtotal</span><span class="theme-amount">{currency.format(s.subTotal)}</span></div>
        <div class="flex justify-between text-ink-secondary"><span>Fee</span><span class="theme-amount">{currency.format(s.totalFee)}</span></div>
        <div class="flex justify-between text-ink-secondary"><span>Discount</span><span class="theme-amount">-{currency.format(s.totalDiscount)}</span></div>
        <div class="flex justify-between border-t border-hairline pt-2 font-semibold text-ink"><span>Grand total</span><span class="theme-amount">{currency.format(s.grandTotal)}</span></div>
        <div class="mt-2 flex justify-between text-success"><span>Paid</span><span class="theme-amount">{currency.format(s.totalPaid)}</span></div>
        <div class="flex justify-between text-danger"><span>Unpaid</span><span class="theme-amount">{currency.format(s.totalUnpaid)}</span></div>
         <div class="flex justify-between text-ink-secondary"><span>Refunded</span><span class="theme-amount">{currency.format(s.totalRefunded)}</span></div>
        <div class="flex justify-between text-ink-secondary"><span>Unrefunded</span><span class="theme-amount">{currency.format(s.totalUnrefunded)}</span></div> 
      </div>
    </div>
  {/if}
</div>
