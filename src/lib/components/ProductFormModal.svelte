<script>
  import { run, preventDefault } from 'svelte/legacy';

  import { LoaderCircle, TriangleAlert } from 'lucide-svelte';
  import Modal from './Modal.svelte';
  import { createProduct, updateProduct } from '../api/products.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';

  
  /**
   * @typedef {Object} Props
   * @property {object|null} [product]
   * @property {any} [categories]
   * @property {boolean} [open]
   * @property {any} [onClose]
   * @property {any} [onSaved]
   */

  /** @type {Props} */
  let {
    product = null,
    categories = [],
    open = false,
    onClose = () => {},
    onSaved = () => {}
  } = $props();
  
  const saving = useAsyncAction((payload) => (product ? updateProduct(product.id, payload) : createProduct(payload)));
 
  let name = $state('');
  let categoryId = $state('');
  let basePrice = $state('');
  let sellPrice = $state('');
  let stockQuantity = $state('');
  let stockMinimum = $state('');

  let isOpenPrevious = $state(false);

  let isEdit = $derived(!!product);

  run(() => {
    if (open && !isOpenPrevious) { 
        name = product?.name ?? '';
        categoryId = product?.category?.id ?? '';
        basePrice = product?.basePrice ?? '';
        sellPrice = product?.sellPrice ?? '';
        stockQuantity = '';
        stockMinimum = product?.stockMinimum ?? '';
        
        isOpenPrevious = true;
        saving.reset();
    } else if (!open) {
      isOpenPrevious = false;
    }
  });

  async function onSubmit() { 
    const payload = {
      name,
      basePrice: Number(basePrice),
      sellPrice: Number(sellPrice),
      stockMinimum: stockMinimum === '' ? undefined : Number(stockMinimum),
      categoryId: categoryId === '' ? undefined : Number(categoryId)
    };
    if (!isEdit) payload.stockQuantity = Number(stockQuantity);

    await saving.run(payload);
    onSaved();
    onClose();
  }
</script>

<Modal {open} {onClose} title={isEdit ? 'Edit product' : 'New product'}>
  <form onsubmit={preventDefault(onSubmit)} class="flex flex-col gap-3.5">
    {#if $saving.error}
      <div aria-live="polite" aria-atomic="true" class="flex items-start gap-2 rounded-control bg-danger-soft px-3 py-2 text-[12.5px] text-danger">
        <TriangleAlert size={15} class="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{$saving.error.message}</span>
      </div>
    {/if}

    <div>
      <label for="p-name" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Name</label>
      <input id="p-name" class="sf-input" type="text" bind:value={name} required />
    </div>

    <div>
      <label for="p-category" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Category</label>
      <select id="p-category" class="sf-input" bind:value={categoryId}>
        <option value="">Uncategorized</option>
        {#each categories as category (category.id)}
          <option value={category.id}>{category.name}</option>
        {/each}
      </select>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label for="p-base" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Base price</label>
        <input id="p-base" class="sf-input" type="number" min="0" step="1" bind:value={basePrice} required />
      </div>
      <div>
        <label for="p-sell" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Sell price</label>
        <input id="p-sell" class="sf-input" type="number" min="0" step="1" bind:value={sellPrice} required />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      {#if !isEdit}
        <div>
          <label for="p-stock" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Initial stock</label>
          <input id="p-stock" class="sf-input" type="number" min="0" step="1" bind:value={stockQuantity} required />
        </div>
      {/if}
      <div>
        <label for="p-min" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Stock minimum</label>
        <input id="p-min" class="sf-input" type="number" min="0" step="1" bind:value={stockMinimum} />
      </div>
    </div>

    {#if isEdit}
      <p class="text-[11.5px] text-ink-secondary">
        Stock quantity can't be edited here — use Stock Cards to record stock movements.
      </p>
    {/if}

    <div class="mt-2 flex justify-end gap-2">
      <button type="button" class="sf-btn-secondary" onclick={onClose}>Cancel</button>
      <button type="submit" class="sf-btn-primary" disabled={$saving.loading}>
        {#if $saving.loading}
          <LoaderCircle size={14} class="animate-spin" />
        {/if}
        {isEdit ? 'Save changes' : 'Create product'}
      </button>
    </div>
  </form>
</Modal>
