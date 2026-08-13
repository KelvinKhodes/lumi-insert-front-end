<script>
  import { LoaderCircle, TriangleAlert } from 'lucide-svelte';
  import Modal from './Modal.svelte';
  import { createMemo } from '../api/memos.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';

  export let open = false;
  export let onClose = () => {};
  export let onSaved = () => {};

  const saving = useAsyncAction(createMemo);

  let title = '';
  let body = '';
  let role = '';
  let images = null;

  $: if (open) {
    title = '';
    body = '';
    role = '';
    images = null;
    saving.reset();
  }

  async function onSubmit() {
    try {
      await saving.run({
        title,
        body,
        role: role || undefined,
        images: images?.length ? Array.from(images) : undefined
      });
      onSaved();
      onClose();
    } catch {
      // error state already surfaced via $saving.error below
    }
  }
</script>

<Modal {open} {onClose} title="New memo" maxWidthClass="max-w-[440px]">
  <form on:submit|preventDefault={onSubmit} class="flex flex-col gap-3.5">
    {#if $saving.error}
      <div class="flex items-start gap-2 rounded-control bg-danger-soft px-3 py-2 text-[12.5px] text-danger">
        <TriangleAlert size={15} class="mt-0.5 shrink-0" />
        <span>{$saving.error.message}</span>
      </div>
    {/if}

    <div>
      <label for="m-title" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Title</label>
      <input id="m-title" class="sf-input" type="text" bind:value={title} required />
    </div>

    <div>
      <label for="m-body" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Message</label>
      <textarea id="m-body" class="sf-input" rows="4" bind:value={body} required></textarea>
    </div>

    <div>
      <label for="m-role" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Send to</label>
      <select id="m-role" class="sf-input" bind:value={role}>
        <option value="">Everyone</option>
        <option value="OWNER">Owner</option>
        <option value="FINANCE">Finance</option>
        <option value="CASHIER">Cashier</option>
        <option value="WAREHOUSE">Warehouse</option>
      </select>
    </div>

    <div>
      <label for="m-images" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Attachments (optional)</label>
      <input
        id="m-images"
        type="file"
        accept="image/*"
        multiple
        class="sf-input !py-1.5 text-[12px]"
        on:change={(e) => (images = e.currentTarget.files)}
      />
    </div>

    <div class="mt-2 flex justify-end gap-2">
      <button type="button" class="sf-btn-secondary" on:click={onClose}>Cancel</button>
      <button type="submit" class="sf-btn-primary" disabled={$saving.loading}>
        {#if $saving.loading}
          <LoaderCircle size={14} class="animate-spin" />
        {/if}
        Post memo
      </button>
    </div>
  </form>
</Modal>
