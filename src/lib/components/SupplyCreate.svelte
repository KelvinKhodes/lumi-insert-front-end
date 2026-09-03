<script>
  import { navigate } from 'svelte-routing';
  import { LoaderCircle, TriangleAlert, Plus, Trash2, ArrowLeft } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { createSupply } from '../api/supplies.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import ProductPicker from './ProductPicker.svelte';
  import SupplierPicker from './SupplierPicker.svelte';

  pageTitle.set('New supply');

  const saving = useAsyncAction(createSupply);

  let supplier = $state(null);
  let invoiceId = $state('');
  let description = $state('');
  let totalFee = $state('0');
  let totalDiscount = $state('0');

  /** @type {{ productId:number, name:string, price:string, quantity:string, description:string }[]} */
  let items = $state([]);

  function addItem(product) {
    if (items.some((i) => i.productId === product.id)) return;
    items = [...items, { productId: product.id, name: product.name, price: '', quantity: '1', description: '' }];
  }

  function removeItem(index) {
    items = items.filter((_, i) => i !== index);
  }

  let subTotal = $derived(items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0));
  let grandTotal = $derived(subTotal + (Number(totalFee) || 0) - (Number(totalDiscount) || 0));

  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  async function onSubmit() {
    if (!supplier || items.length === 0) return;
    try {
      const data = await saving.run({
        supplierId: supplier.id,
        invoiceId,
        description: description || undefined,
        totalFee: Number(totalFee) || 0,
        totalDiscount: Number(totalDiscount) || 0,
        supplyItems: items.map((item) => ({
          productId: item.productId,
          price: Number(item.price),
          quantity: Number(item.quantity),
          description: item.description || undefined
        }))
      });
      navigate(`/supplies/${data.id}`, { replace: true });
    } catch {
      // error state already surfaced via $saving.error below
    }
  }
</script>

<div class="p-5 md:p-7">
  <button class="mb-4 flex items-center gap-1 text-[13px] text-ink-secondary hover:text-ink" onclick={() => navigate('/supplies')}>
    <ArrowLeft size={14} />Back to supplies
  </button>

  <h1 class="mb-5 text-[20px] font-semibold text-ink">New supply order</h1>

  {#if $saving.error}
    <div class="mb-4 flex items-start gap-2 rounded-control bg-danger-soft px-3 py-2 text-[12.5px] text-danger">
      <TriangleAlert size={15} class="mt-0.5 shrink-0" />
      <span>{$saving.error.message}</span>
    </div>
  {/if}

  <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
    <div class="sf-card p-4 lg:col-span-2">
      <h2 class="mb-3 text-[13.5px] font-semibold text-ink">Items</h2>

      <ProductPicker isButtonActiveWhenOutOfStock={true} onSelect={addItem} placeholder="Search a product to add…" />

      {#if items.length}
        <div class="mt-3 flex flex-col divide-y divide-hairline">
          {#each items as item, index (item.productId)}
            <div class="grid grid-cols-[1fr_90px_70px_32px] items-center gap-2 py-2">
              <span class="truncate text-[13px] font-medium text-ink">{item.name}</span>
              <input class="sf-input !py-1.5 text-[12.5px]" type="number" min="0" placeholder="Price" bind:value={item.price} required />
              <input class="sf-input !py-1.5 text-[12.5px]" type="number" min="1" placeholder="Qty" bind:value={item.quantity} required />
              <button type="button" class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05] hover:text-danger" onclick={() => removeItem(index)} aria-label="Remove supply item">
                <Trash2 size={14} />
              </button>
            </div>
          {/each}
        </div>
      {:else}
        <p class="mt-3 text-[12.5px] text-ink-secondary">No items added yet — search above to add products.</p>
      {/if}
    </div>

    <div class="sf-card flex flex-col gap-3.5 p-4">
      <h2 class="text-[13.5px] font-semibold text-ink">Details</h2>

      <div>
        <label for="sp-supplier" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Supplier</label>
        <SupplierPicker onSelect={(s) => (supplier = s)} />
      </div>

      <div>
        <label for="sp-invoice" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Invoice ID</label>
        <input id="sp-invoice" class="sf-input" type="text" bind:value={invoiceId} required />
      </div>

      <div>
        <label for="sp-desc" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Description</label>
        <textarea id="sp-desc" class="sf-input" rows="2" bind:value={description}></textarea>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="sp-fee" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Fee</label>
          <input id="sp-fee" class="sf-input" type="number" min="0" bind:value={totalFee} />
        </div>
        <div>
          <label for="sp-discount" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Discount</label>
          <input id="sp-discount" class="sf-input" type="number" min="0" bind:value={totalDiscount} />
        </div>
      </div>

      <div class="border-t border-hairline pt-3">
        <div class="flex justify-between text-[12.5px] text-ink-secondary">
          <span>Subtotal</span><span class="theme-amount">{currency.format(subTotal)}</span>
        </div>
        <div class="mt-1 flex justify-between text-[14px] font-semibold text-ink">
          <span>Grand total</span><span class="theme-amount">{currency.format(grandTotal)}</span>
        </div>
      </div>

      <button
        type="button"
        class="sf-btn-primary w-full"
        onclick={onSubmit}
        disabled={$saving.loading || !supplier || !invoiceId || items.length === 0}
      >
        {#if $saving.loading}
          <LoaderCircle size={14} class="animate-spin" />
        {:else}
          <Plus size={14} />
        {/if}
        Create supply order
      </button>
    </div>
  </div>
</div>
