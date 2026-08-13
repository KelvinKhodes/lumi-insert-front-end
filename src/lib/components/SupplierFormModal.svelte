<script>
  import { LoaderCircle, TriangleAlert } from 'lucide-svelte';
  import Modal from './Modal.svelte';
  import { createSupplier, updateSupplier } from '../api/suppliers.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';

  /** @type {object|null} pass a supplier to edit, or null to create */
  export let supplier = null;
  export let open = false;
  export let onClose = () => {};
  export let onSaved = () => {};

  $: isEdit = !!supplier;

  const saving = useAsyncAction((payload) => (isEdit ? updateSupplier(supplier.id, payload) : createSupplier(payload)));

  let name = '';
  let email = '';
  let contact = '';
  let isActive = true;

  $: if (open) {
    name = supplier?.name ?? '';
    email = supplier?.email ?? '';
    contact = supplier?.contact ?? '';
    isActive = supplier?.isActive ?? true;
    saving.reset();
  }

  async function onSubmit() {
    const payload = isEdit ? { name, email, contact, isActive } : { name, email, contact };
    try {
      await saving.run(payload);
      onSaved();
      onClose();
    } catch {
      // error state already surfaced via $saving.error below
    }
  }
</script>

<Modal {open} {onClose} title={isEdit ? 'Edit supplier' : 'New supplier'} maxWidthClass="max-w-[400px]">
  <form on:submit|preventDefault={onSubmit} class="flex flex-col gap-3.5">
    {#if $saving.error}
      <div class="flex items-start gap-2 rounded-control bg-danger-soft px-3 py-2 text-[12.5px] text-danger">
        <TriangleAlert size={15} class="mt-0.5 shrink-0" />
        <span>{$saving.error.message}</span>
      </div>
    {/if}

    <div>
      <label for="s-name" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Name</label>
      <input id="s-name" class="sf-input" type="text" bind:value={name} required />
    </div>

    <div>
      <label for="s-email" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Email</label>
      <input id="s-email" class="sf-input" type="email" bind:value={email} />
    </div>

    <div>
      <label for="s-contact" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Contact</label>
      <input id="s-contact" class="sf-input" type="text" bind:value={contact} required />
    </div>

    {#if isEdit}
      <label class="flex items-center gap-2 text-[13px] text-ink">
        <input type="checkbox" class="h-4 w-4 rounded accent-accent" bind:checked={isActive} />
        Active supplier
      </label>
    {/if}

    <div class="mt-2 flex justify-end gap-2">
      <button type="button" class="sf-btn-secondary" on:click={onClose}>Cancel</button>
      <button type="submit" class="sf-btn-primary" disabled={$saving.loading}>
        {#if $saving.loading}
          <LoaderCircle size={14} class="animate-spin" />
        {/if}
        {isEdit ? 'Save changes' : 'Create supplier'}
      </button>
    </div>
  </form>
</Modal>
