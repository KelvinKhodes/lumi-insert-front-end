<script>
  import { run, preventDefault } from 'svelte/legacy';

  import { LoaderCircle, TriangleAlert, ImagePlus, Check } from 'lucide-svelte';
  import Modal from './Modal.svelte';
  import { createCustomer, updateCustomer, getCustomer, uploadCustomerPictures } from '../api/customers.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';

  
  /**
   * @typedef {Object} Props
   * @property {string|null} [customerId]
   * @property {boolean} [open]
   * @property {any} [onClose]
   * @property {any} [onSaved]
   */

  /** @type {Props} */
  let {
    customer = null,
    open = false,
    onClose = () => {},
    onSaved = () => {}
  } = $props();

  let isEdit = $derived(!!customer);

  const detail = useAsyncAction(getCustomer);
  const saving = useAsyncAction((payload) => (isEdit ? updateCustomer(customer.id, payload) : createCustomer(payload)));
  const uploading = useAsyncAction((files) => uploadCustomerPictures(customer.id, files));

  let name = $state('');
  let email = $state('');
  let contact = $state('');
  let shippingAddress = $state('');
  let isActive = $state(true);
  let pictureFiles = $state(null);

  run(() => {
    if (open) {
      saving.reset();
      uploading.reset();
      pictureFiles = null;
      if (isEdit) {
          name = customer.name ?? '';
          email = customer.email ?? '';
          contact = customer.contact ?? '';
          shippingAddress = customer.shippingAddress ?? '';
          isActive = customer.isActive ?? true;
      } else {
        detail.reset();
        name = '';
        email = '';
        contact = '';
        shippingAddress = '';
        isActive = true;
      }
    }
  });

  async function onSubmit() {
    const payload = isEdit
      ? { 
        name: name == customer.name ? undefined : name, 
        email: email == customer.email ? undefined : email, 
        contact: contact == customer.contact ? undefined : contact, 
        shippingAddress: shippingAddress == customer.shippingAddress ? undefined : shippingAddress, 
        isActive: isActive === customer.isActive ? undefined : isActive }
      : { name, email, contact, shippingAddress };
    await saving.run(payload);
    onSaved();
    onClose();
  }

  async function onUploadPictures() {
    if (!pictureFiles?.length) return;
    await uploading.run(Array.from(pictureFiles));
    pictureFiles = null;
  }
</script>

<Modal {open} {onClose} title={isEdit ? 'Edit customer' : 'New customer'} maxWidthClass="max-w-[460px]">
  {#if isEdit && detail.loading}
    <div class="flex justify-center py-10"><LoaderCircle size={20} class="animate-spin text-ink-tertiary" /></div>
  {:else}
    <form onsubmit={preventDefault(onSubmit)} class="flex flex-col gap-3.5">
      {#if $saving.error}
        <div class="flex items-start gap-2 rounded-control bg-danger-soft px-3 py-2 text-[12.5px] text-danger">
          <TriangleAlert size={15} class="mt-0.5 shrink-0" />
          <span>{$saving.error.message}</span>
        </div>
      {/if}

      {#if isEdit && $detail.data}
        <div class="grid grid-cols-3 gap-2 rounded-control bg-surface-muted p-3 text-center">
          <div>
            <p class="text-[13px] font-semibold text-ink">{$detail.data.totalTransaction ?? 0}</p>
            <p class="text-[10.5px] text-ink-secondary">Transactions</p>
          </div>
          <div>
            <p class="text-[13px] font-semibold text-danger">{($detail.data.totalUnpaid ?? 0).toLocaleString('id-ID')}</p>
            <p class="text-[10.5px] text-ink-secondary">Unpaid</p>
          </div>
          <div>
            <p class="text-[13px] font-semibold text-success">{($detail.data.totalPaid ?? 0).toLocaleString('id-ID')}</p>
            <p class="text-[10.5px] text-ink-secondary">Paid</p>
          </div>
        </div>
      {/if}

      <div>
        <label for="cu-name" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Name</label>
        <input id="cu-name" class="sf-input" type="text" bind:value={name} required />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="cu-email" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Email</label>
          <input id="cu-email" class="sf-input" type="email" bind:value={email} />
        </div>
        <div>
          <label for="cu-contact" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Contact</label>
          <input id="cu-contact" class="sf-input" type="text" bind:value={contact} required />
        </div>
      </div>

      <div>
        <label for="cu-address" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Shipping address</label>
        <textarea id="cu-address" class="sf-input" rows="2" bind:value={shippingAddress} required></textarea>
      </div>

      {#if isEdit}
        <label class="flex items-center gap-2 text-[13px] text-ink">
          <input type="checkbox" class="h-4 w-4 rounded accent-accent" bind:checked={isActive} />
          Active customer
        </label>
      {/if}

      <div class="mt-2 flex justify-end gap-2">
        <button type="button" class="sf-btn-secondary" onclick={onClose}>Cancel</button>
        <button type="submit" class="sf-btn-primary" disabled={$saving.loading}>
          {#if $saving.loading}
            <LoaderCircle size={14} class="animate-spin" />
          {/if}
          {isEdit ? 'Save changes' : 'Create customer'}
        </button>
      </div>
    </form>

    {#if isEdit}
      <div class="mt-5 border-t border-hairline pt-4">
        <p class="mb-2 text-[12.5px] font-medium text-ink-secondary">Customer pictures</p>
        {#if $uploading.error}
          <p class="mb-2 text-[12px] text-danger">{$uploading.error.message}</p>
        {/if}
        {#if $uploading.success}
          <p class="mb-2 flex items-center gap-1 text-[12px] text-success"><Check size={13} />Uploaded successfully.</p>
        {/if}
        <div class="flex items-center gap-2">
          <input
            id="cu-pictures"
            type="file"
            accept="image/*"
            multiple
            class="sf-input flex-1 !py-1.5 text-[12px]"
            onchange={(e) => (pictureFiles = e.currentTarget.files)}
          />
          <button type="button" class="sf-btn-secondary shrink-0" onclick={onUploadPictures} disabled={!pictureFiles?.length || $uploading.loading}>
            {#if $uploading.loading}
              <LoaderCircle size={14} class="animate-spin" />
            {:else}
              <ImagePlus size={14} />
            {/if}
            Upload
          </button>
        </div>
      </div>
    {/if}
  {/if}
</Modal>
