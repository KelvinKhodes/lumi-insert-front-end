<script>
  import Modal from './Modal.svelte';

  /** @typedef {Object} Props
   * @property {boolean} [open]
   * @property {() => void} [onClose]
   * @property {() => void} [onApply]
   * @property {() => void} [onReset]
   * @property {Record<string, any>} [filters]
   */

  /** @type {Props} */
  let { open = false, onClose = () => {}, onApply = () => {}, onReset = () => {}, filters = {} } = $props();

  const typeOptions = [
    { id: '', value: 'All types' },
    { id: 'CUSTOMER_IN', value: 'Customer in' },
    { id: 'CUSTOMER_OUT', value: 'Customer out' },
    { id: 'SUPPLIER_IN', value: 'Supplier in' },
    { id: 'SUPPLIER_OUT', value: 'Supplier out' },
    { id: 'DEFECT', value: 'Defect' },
    { id: 'REPAIRED', value: 'Repaired' }
  ];

  const sortOptions = [
    { id: 'createdAt', value: 'Created at' },
    { id: 'updatedAt', value: 'Updated at' },
    { id: 'type', value: 'Type' }
  ];
</script>

<Modal open={open} title="Advanced stock card filters" onClose={onClose} maxWidthClass="max-w-[760px]">
  <form class="space-y-4" onsubmit={(event) => { event.preventDefault(); onApply(); }}>
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary md:col-span-2">
        Product ID
        <input class="sf-input" type="number" min="1" bind:value={filters.productId} placeholder="Product ID" />
      </label>
      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary md:col-span-2">
        Movement type
        <select class="sf-input" bind:value={filters.type}>
          {#each typeOptions as option (option.id)}
            <option value={option.id}>{option.value}</option>
          {/each}
        </select>
      </label>
      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        Created from
        <input class="sf-input" type="datetime-local" bind:value={filters.minCreatedAt} />
      </label>
      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        Created to
        <input class="sf-input" type="datetime-local" bind:value={filters.maxCreatedAt} />
      </label>
      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        Sort by
        <select class="sf-input" bind:value={filters.sortBy}>
          {#each sortOptions as option (option.id)}
            <option value={option.id}>{option.value}</option>
          {/each}
        </select>
      </label>
      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        Sort direction
        <select class="sf-input" bind:value={filters.sortDirection}>
          <option value="DESC">Descending</option>
          <option value="ASC">Ascending</option>
        </select>
      </label>
    </div>

    <div class="flex justify-end gap-2">
      <button type="button" class="sf-btn-secondary" onclick={onReset}>Reset</button>
      <button type="submit" class="sf-btn-primary">Apply</button>
    </div>
  </form>
</Modal>
