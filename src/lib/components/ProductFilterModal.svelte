<script>
  import RangeSlider from 'svelte-range-slider-pips';
  import Modal from './Modal.svelte';

  /**
   * @typedef {Object} Props
   * @property {boolean} [open]
   * @property {() => void} [onClose]
   * @property {() => void} [onApply]
   * @property {() => void} [onReset]
   * @property {Record<string, any>} [payload]
   * @property {any[]} [categories]
   */

  /** @type {Props} */
  let {
    open = false,
    onClose = () => {},
    onApply = () => {},
    onReset = () => {},
    payload = {},
    categories = []
  } = $props();

  const priceMax = 50000000;
  let priceValues = $state([0, priceMax]);
  let previousPayload = $state();

  const sortOptions = [
    { id: 'createdAt', value: 'Created at' },
    { id: 'updatedAt', value: 'Updated at' },
    { id: 'sellPrice', value: 'Sell price' },
    { id: 'basePrice', value: 'Base price' },
    { id: 'stockQuantity', value: 'Stock quantity' }
  ];

  const directionOptions = [
    { id: 'DESC', value: 'Descending' },
    { id: 'ASC', value: 'Ascending' }
  ];

  function valueOrDefault(value, fallback) {
    return value === '' || value == null ? fallback : Number(value);
  }

  function syncPriceRange() {
    payload.minPrice = priceValues[0];
    payload.maxPrice = priceValues[1];
  }

  function setPriceValue(index, event) {
    const value = Math.max(0, Math.min(priceMax, Number(event.currentTarget.value) || 0));
    priceValues[index] = value;
    syncPriceRange();
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID').format(value);
  }

  $effect(() => {
    if (payload !== previousPayload) {
      previousPayload = payload;
      priceValues = [
        valueOrDefault(payload.minPrice, 0),
        valueOrDefault(payload.maxPrice, priceMax)
      ];
    }
  });
</script>

<Modal open={open} title="Advanced product filters" onClose={onClose} maxWidthClass="max-w-[760px]">
  <form class="space-y-4" onsubmit={(event) => { event.preventDefault(); onApply(); }}>
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary md:col-span-2">
        Product name
        <input class="sf-input" type="text" bind:value={payload.nameQuery} placeholder="Search by product name" />
      </label>

      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary md:col-span-2">
        Category
        <select class="sf-input" bind:value={payload.categoryId}>
          <option value="">All categories</option>
          {#each categories as category (category.id)}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
      </label>

      <div class="flex flex-col gap-2 md:col-span-2 xl:col-span-4">
        <div class="flex items-center justify-between text-[12px] text-ink-secondary">
          <span>Price range</span>
          <span>Rp {formatCurrency(priceValues[0])} - {priceValues[1] === priceMax ? 'Any' : `Rp ${formatCurrency(priceValues[1])}`}</span>
        </div>
        <RangeSlider min={0} max={priceMax} step={50000} range bind:values={priceValues} onchange={syncPriceRange} />
        <div class="grid grid-cols-2 gap-2">
          <input class="sf-input" type="number" min="0" max={priceValues[1]} step="50000" value={priceValues[0]} oninput={(event) => setPriceValue(0, event)} aria-label="Minimum price" />
          <input class="sf-input" type="number" min={priceValues[0]} max={priceMax} step="50000" value={priceValues[1] === priceMax ? '' : priceValues[1]} placeholder="No maximum" oninput={(event) => setPriceValue(1, event)} aria-label="Maximum price" />
        </div>
      </div>

      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary md:col-span-2">
        Sort by
        <select class="sf-input" bind:value={payload.sortBy}>
          {#each sortOptions as option (option.id)}
            <option value={option.id}>{option.value}</option>
          {/each}
        </select>
      </label>

      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary md:col-span-2">
        Sort direction
        <select class="sf-input" bind:value={payload.sortDirection}>
          {#each directionOptions as option (option.id)}
            <option value={option.id}>{option.value}</option>
          {/each}
        </select>
      </label>
    </div>

    <div class="flex justify-end gap-2">
      <button type="button" class="sf-btn-secondary" onclick={onReset}>Reset</button>
      <button type="submit" class="sf-btn-primary">Apply</button>
    </div>
  </form>
</Modal>
