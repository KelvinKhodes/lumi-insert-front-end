<script>
  import { run, preventDefault } from 'svelte/legacy';

  import { LoaderCircle, TriangleAlert } from 'lucide-svelte';
  import Modal from './Modal.svelte';
  import { createCategory, updateCategory } from '../api/categories.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';

  
  /**
   * @typedef {Object} Props
   * @property {object|null} [category]
   * @property {boolean} [open]
   * @property {any} [onClose]
   * @property {any} [onSaved]
   */

  /** @type {Props} */
  let {
    category = null,
    open = false,
    onClose = () => {},
    onSaved = () => {}
  } = $props();

  const saving = useAsyncAction(
    (payload) => (category ? updateCategory(category.id, payload) : createCategory(payload))
  );

  let name = $state('');

  let isOpenPrevious = $state(false);

  let isEdit = $derived(!!category);

  run(() => {
    if (open && !isOpenPrevious) {
      name = category?.name ?? '';
      saving.reset();
      isOpenPrevious = true;
    } else if (!open) {
      isOpenPrevious = false;
    }
  });

  async function onSubmit() {
    await saving.run({ name });
    onSaved();
    onClose();
  }
</script>

<Modal {open} {onClose} title={isEdit ? 'Edit category' : 'New category'} maxWidthClass="max-w-[360px]">
  <form onsubmit={preventDefault(onSubmit)} class="flex flex-col gap-3.5">
    {#if $saving.error}
      <div class="flex items-start gap-2 rounded-control bg-danger-soft px-3 py-2 text-[12.5px] text-danger">
        <TriangleAlert size={15} class="mt-0.5 shrink-0" />
        <span>{$saving.error.message}</span>
      </div>
    {/if}

    <div>
      <label for="c-name" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Name</label>
      <input id="c-name" class="sf-input" type="text" bind:value={name} required autofocus />
    </div>

    <div class="mt-2 flex justify-end gap-2">
      <button type="button" class="sf-btn-secondary" onclick={onClose}>Cancel</button>
      <button type="submit" class="sf-btn-primary" disabled={$saving.loading}>
        {#if $saving.loading}
          <LoaderCircle size={14} class="animate-spin" />
        {/if}
        {isEdit ? 'Save changes' : 'Create category'}
      </button>
    </div>
  </form>
</Modal>
