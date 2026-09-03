<script>
  import Modal from './Modal.svelte';

  /**
   * @typedef {Object} Props
   * @property {boolean} [open]
   * @property {() => void} [onClose]
   * @property {() => void} [onApply]
   * @property {() => void} [onReset]
   * @property {Record<string, any>} [filters]
   * @property {string[]} [actionOptions]
   */

  /** @type {Props} */
  let {
    open = false,
    onClose = () => {},
    onApply = () => {},
    onReset = () => {},
    filters = {},
    actionOptions = []
  } = $props();

  function actionLabel(action) {
    return action ? action.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : '—';
  }
</script>

<Modal open={open} title="Advanced filters" onClose={onClose} maxWidthClass="max-w-[760px]">
  <form class="space-y-4" onsubmit={(event) => { event.preventDefault(); onApply(); }}>
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        Entity name
        <input class="sf-input" type="text" bind:value={filters.entityName} placeholder="products" />
      </label>

      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        Entity ID
        <input class="sf-input" type="text" bind:value={filters.entityId} placeholder="10" />
      </label>

      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        Action
        <select class="sf-input" bind:value={filters.action}>
          <option value="">All actions</option>
          {#each actionOptions as action (action)}
            <option value={action}>{actionLabel(action)}</option>
          {/each}
        </select>
      </label>

      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        Created by
        <input class="sf-input" type="text" bind:value={filters.createdBy} placeholder="OWNER" />
      </label>

      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        IP address
        <input class="sf-input" type="text" bind:value={filters.ipAddress} placeholder="0.0.1.1" />
      </label>

      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        From
        <input class="sf-input" type="datetime-local" bind:value={filters.minCreatedAt} />
      </label>

      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        To
        <input class="sf-input" type="datetime-local" bind:value={filters.maxCreatedAt} />
      </label>

      <div class="flex items-end gap-2">
        <button type="submit" class="sf-btn-primary w-full">Apply</button>
        <button type="button" class="sf-btn-secondary w-full" onclick={onReset}>Reset</button>
      </div>
    </div>
  </form>
</Modal>
