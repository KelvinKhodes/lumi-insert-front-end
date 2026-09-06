<script>
  import { run, preventDefault } from 'svelte/legacy';

  import { LoaderCircle, TriangleAlert, Check, ImagePlus } from 'lucide-svelte';
  import Modal from './Modal.svelte';
  import { createProduct, updateProduct, uploadProductPictures } from '../api/products.js';
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
  const uploading = useAsyncAction((id, files) => uploadProductPictures(id, files));

  const maxImageSize = 10 * 1024 * 1024;
  const maxImageCount = 5;
 
  let name = $state('');
  let categoryId = $state('');
  let basePrice = $state('');
  let sellPrice = $state('');
  let stockQuantity = $state('');
  let stockMinimum = $state('');
  let pictureFiles = $state([]);
  let imageError = $state('');

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
        pictureFiles = [];
        imageError = '';
        
        isOpenPrevious = true;
        saving.reset();
        uploading.reset();
    } else if (!open) {
      isOpenPrevious = false;
    }
  });

  function onPictureSelected(event) {
    const files = Array.from(event.currentTarget.files ?? []);
    if (!files.length) return;
    if (files.length > maxImageCount) {
      imageError = `You can upload up to ${maxImageCount} images at a time.`;
      event.currentTarget.value = '';
      return;
    }

    const invalidFile = files.find((file) => !file.type.startsWith('image/'));
    if (invalidFile) {
      imageError = `${invalidFile.name} is not an image.`;
      event.currentTarget.value = '';
      return;
    }

    const oversizedFile = files.find((file) => file.size > maxImageSize);
    if (oversizedFile) {
      imageError = `${oversizedFile.name} exceeds the 10 MB image limit.`;
      event.currentTarget.value = '';
      return;
    }

    imageError = '';
    uploading.reset();
    pictureFiles = files;
    event.currentTarget.value = '';
  }

  async function onUploadPicture() {
    if (!pictureFiles.length || !isEdit) return;
    await uploading.run(product.id, pictureFiles);
    pictureFiles = [];
  }

  async function onSubmit() { 
    const payload = {
      name,
      basePrice: Number(basePrice),
      sellPrice: Number(sellPrice),
      stockMinimum: stockMinimum === '' ? undefined : Number(stockMinimum),
      categoryId: categoryId === '' ? undefined : Number(categoryId)
    };
    if (!isEdit) payload.stockQuantity = Number(stockQuantity);

    const savedProduct = await saving.run(payload);
    const productId = savedProduct?.id ?? product?.id;
    if (pictureFiles.length && productId) {
      await uploading.run(productId, pictureFiles);
    }
    pictureFiles = [];
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

    {#if isEdit}
      <div class="mt-1 flex flex-col gap-2 border-t border-hairline pt-4">
        <p class="mb-1 flex items-center gap-1.5 text-[12.5px] font-medium text-ink-secondary">
          <ImagePlus size={13} />Product image
        </p>
        {#if $uploading.error}<p class="mb-1 text-[12px] text-danger" role="alert">{$uploading.error.message}</p>{/if}
        {#if $uploading.success}<p class="mb-1 flex items-center gap-1 text-[12px] text-success"><Check size={13} />Uploaded.</p>{/if}
        <div class="flex items-center gap-2">
          <input id="p-picture" type="file" accept="image/*" multiple class="sf-input flex-1 !py-1.5 text-[12px]" onchange={onPictureSelected} />
          <button type="button" class="sf-btn-secondary shrink-0" onclick={onUploadPicture} disabled={!pictureFiles.length || $uploading.loading}>
            {#if $uploading.loading}<LoaderCircle size={14} class="animate-spin" />{:else}Upload{/if}
          </button>
        </div>
        {#if imageError}<p class="text-[12px] text-danger" role="alert">{imageError}</p>{/if}
        {#if pictureFiles.length}<p class="text-[12px] text-ink-secondary">{pictureFiles.length} image{pictureFiles.length === 1 ? '' : 's'} selected.</p>{/if}
        <p class="text-[11px] text-ink-tertiary">Up to 5 images, maximum 10 MB each.</p>
      </div>
    {:else}
      <div class="flex flex-col gap-2">
        <label for="p-picture-new" class="mb-1 flex items-center gap-1.5 text-[12.5px] font-medium text-ink-secondary">
          <ImagePlus size={13} />Product image
        </label>
        <input id="p-picture-new" type="file" accept="image/*" multiple class="sf-input !py-1.5 text-[12px]" onchange={onPictureSelected} />
        {#if imageError}<p class="text-[12px] text-danger" role="alert">{imageError}</p>{/if}
        {#if pictureFiles.length}<p class="text-[12px] text-ink-secondary">{pictureFiles.length} image{pictureFiles.length === 1 ? '' : 's'} selected.</p>{/if}
        <p class="text-[11px] text-ink-tertiary">Up to 5 images, maximum 10 MB each.</p>
      </div>
    {/if}

    <div class="mt-2 flex justify-end gap-2">
      <button type="button" class="sf-btn-secondary" onclick={onClose}>Cancel</button>
      <button type="submit" class="sf-btn-primary" disabled={$saving.loading || $uploading.loading}>
        {#if $saving.loading || $uploading.loading}
          <LoaderCircle size={14} class="animate-spin" />
        {/if}
        {isEdit ? 'Save changes' : 'Create product'}
      </button>
    </div>
  </form>
</Modal>
