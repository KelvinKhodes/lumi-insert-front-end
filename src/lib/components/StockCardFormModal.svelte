<script>
  import { run, preventDefault } from 'svelte/legacy';

  import { LoaderCircle, TriangleAlert } from 'lucide-svelte';
  import Modal from './Modal.svelte';
  import ProductPicker from './ProductPicker.svelte';
  import { createStockCard } from '../api/stockcards.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';

  /**
   * @typedef {Object} Props
   * @property {boolean} [open]
   * @property {any} [onClose]
   * @property {any} [onSaved]
   */

  /** @type {Props} */
  let { open = false, onClose = () => {}, onSaved = () => {} } = $props();

  const saving = useAsyncAction(createStockCard);

  let referenceId = $state('');
  let selectedProduct = $state(null);
  let quantity = $state('');
  let type = $state('DEFECT');
  let description = $state('');

  run(() => {
    if (open) {
      referenceId = '';
      selectedProduct = null;
      quantity = '';
      type = 'DEFECT';
      description = '';
      saving.reset();
    }
  });

  async function onSubmit() {
    if (!selectedProduct) return;
    try {
      await saving.run({
        referenceId,
        productId: selectedProduct.id,
        quantity: Number(quantity),
        type,
        description: description || undefined
      });
      onSaved();
      onClose();
    } catch {
      // error state already surfaced via $saving.error below
    }
  }
</script>

<Modal {open} {onClose} title="New stock card" maxWidthClass="max-w-[420px]">
  <form onsubmit={preventDefault(onSubmit)} class="flex flex-col gap-3.5">
    {#if $saving.error}
      <div class="flex items-start gap-2 rounded-control bg-danger-soft px-3 py-2 text-[12.5px] text-danger">
        <TriangleAlert size={15} class="mt-0.5 shrink-0" />
        <span>{$saving.error.message}</span>
      </div>
    {/if}

    <div>
      <label for="sc-ref-id" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Reference ID</label>
      <input id="sc-ref-id" class="sf-input" rows="2" bind:value={referenceId} required/>
    </div>

    <div>
      <label class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary" for="sc-product">Product</label>
      <ProductPicker onSelect={(p) => (selectedProduct = p)} placeholder="Search a product…" />
      {#if !selectedProduct}
        <p class="mt-1 text-[11px] text-ink-tertiary">Pick a product from the search results.</p>
      {/if}
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label for="sc-type" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Type</label>
        <select id="sc-type" class="sf-input" bind:value={type}>
          <option value="DEFECT">Defect</option>
          <option value="REPAIRED">Repaired</option>
          <option value="CUSTOMER_IN">Customer in (return)</option>
          <option value="CUSTOMER_OUT">Customer out</option>
          <option value="SUPPLIER_IN">Supplier in</option>
          <option value="SUPPLIER_OUT">Supplier out</option>
        </select>
      </div>
      <div>
        <label for="sc-qty" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Quantity</label>
        <input id="sc-qty" class="sf-input" type="number" step="1" bind:value={quantity} required />
      </div>
    </div>

    <div>
      <label for="sc-desc" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Description</label>
      <textarea id="sc-desc" class="sf-input" rows="2" bind:value={description}></textarea>
    </div>

    <div class="mt-2 flex justify-end gap-2">
      <button type="button" class="sf-btn-secondary" onclick={onClose}>Cancel</button>
      <button type="submit" class="sf-btn-primary" disabled={$saving.loading || !selectedProduct}>
        {#if $saving.loading}
          <LoaderCircle size={14} class="animate-spin" />
        {/if}
        Record
      </button>
    </div>
  </form>
</Modal>
