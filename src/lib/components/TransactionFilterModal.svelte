<script>
  import RangeSlider from 'svelte-range-slider-pips';
  import Modal from './Modal.svelte';

  /** @typedef {Object} Props
   * @property {boolean} [open]
   * @property {() => void} [onClose]
   * @property {() => void} [onApply]
   * @property {() => void} [onReset]
   * @property {Record<string, any>} [filters]
  * @property {string} [title]
   */

  /** @type {Props} */
  let { open = false, onClose = () => {}, onApply = () => {}, onReset = () => {}, filters = {}, title = 'Advanced transaction filters' } = $props();

  const itemMax = 1000;
  const amountMax = 100000000;
  let itemValues = $state([0, itemMax]);
  let grandTotalValues = $state([0, amountMax]);
  let unpaidValues = $state([0, amountMax]);
  let paidValues = $state([0, amountMax]);
  let previousFilters = $state();

  function valueOrDefault(value, fallback) {
    return value === '' || value == null ? fallback : Number(value);
  }

  function syncRange(values, minKey, maxKey, maximum) {
    filters[minKey] = values[0] === 0 ? '' : values[0];
    filters[maxKey] = values[1] === maximum ? '' : values[1];
  }

  function setRangeValue(values, index, event) {
    values[index] = Math.max(0, Number(event.currentTarget.value) || 0);
  }

  function label(values, maximum, currency = false) {
    const format = (value) => currency ? `Rp ${value.toLocaleString('id-ID')}` : value;
    return `${format(values[0])} - ${values[1] === maximum ? 'Any' : format(values[1])}`;
  }

  $effect(() => {
    if (filters !== previousFilters) {
      previousFilters = filters;
      itemValues = [valueOrDefault(filters.minTotalItems, 0), valueOrDefault(filters.maxTotalItems, itemMax)];
      grandTotalValues = [valueOrDefault(filters.minGrandTotal, 0), valueOrDefault(filters.maxGrandTotal, amountMax)];
      unpaidValues = [valueOrDefault(filters.minTotalUnpaid, 0), valueOrDefault(filters.maxTotalUnpaid, amountMax)];
      paidValues = [valueOrDefault(filters.minTotalPaid, 0), valueOrDefault(filters.maxTotalPaid, amountMax)];
    }
  });
</script>

<Modal open={open} {title} onClose={onClose} maxWidthClass="max-w-[760px]">
  <form class="space-y-4" onsubmit={(event) => { event.preventDefault(); onApply(); }}>
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary md:col-span-2">
        Status
        <select class="sf-input" bind:value={filters.status}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESS">Process</option>
          <option value="COMPLETE">Complete</option>
          <option value="CANCELLED">Cancelled</option>
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

      <div class="flex flex-col gap-2 md:col-span-2 xl:col-span-4">
        <div class="flex items-center justify-between text-[12px] text-ink-secondary"><span>Total items</span><span>{label(itemValues, itemMax)}</span></div>
        <RangeSlider min={0} max={itemMax} range bind:values={itemValues} onchange={() => syncRange(itemValues, 'minTotalItems', 'maxTotalItems', itemMax)} />
        <div class="grid grid-cols-2 gap-2">
          <input class="sf-input" type="number" min="0" max={itemValues[1]} value={itemValues[0]} oninput={(event) => { setRangeValue(itemValues, 0, event); syncRange(itemValues, 'minTotalItems', 'maxTotalItems', itemMax); }} aria-label="Minimum total items" />
          <input class="sf-input" type="number" min={itemValues[0]} max={itemMax} value={itemValues[1] === itemMax ? '' : itemValues[1]} placeholder="No maximum" oninput={(event) => { setRangeValue(itemValues, 1, event); syncRange(itemValues, 'minTotalItems', 'maxTotalItems', itemMax); }} aria-label="Maximum total items" />
        </div>
      </div>

      <div class="flex flex-col gap-2 md:col-span-2 xl:col-span-4">
        <div class="flex items-center justify-between text-[12px] text-ink-secondary"><span>Grand total</span><span>{label(grandTotalValues, amountMax, true)}</span></div>
        <RangeSlider min={0} max={amountMax} step={100000} range bind:values={grandTotalValues} onchange={() => syncRange(grandTotalValues, 'minGrandTotal', 'maxGrandTotal', amountMax)} />
        <div class="grid grid-cols-2 gap-2">
          <input class="sf-input" type="number" min="0" max={grandTotalValues[1]} step="100000" value={grandTotalValues[0]} oninput={(event) => { setRangeValue(grandTotalValues, 0, event); syncRange(grandTotalValues, 'minGrandTotal', 'maxGrandTotal', amountMax); }} aria-label="Minimum grand total" />
          <input class="sf-input" type="number" min={grandTotalValues[0]} max={amountMax} step="100000" value={grandTotalValues[1] === amountMax ? '' : grandTotalValues[1]} placeholder="No maximum" oninput={(event) => { setRangeValue(grandTotalValues, 1, event); syncRange(grandTotalValues, 'minGrandTotal', 'maxGrandTotal', amountMax); }} aria-label="Maximum grand total" />
        </div>
      </div>

      <div class="flex flex-col gap-2 md:col-span-2">
        <div class="flex items-center justify-between text-[12px] text-ink-secondary"><span>Total unpaid</span><span>{label(unpaidValues, amountMax, true)}</span></div>
        <RangeSlider min={0} max={amountMax} step={100000} range bind:values={unpaidValues} onchange={() => syncRange(unpaidValues, 'minTotalUnpaid', 'maxTotalUnpaid', amountMax)} />
        <div class="grid grid-cols-2 gap-2">
          <input class="sf-input" type="number" min="0" max={unpaidValues[1]} step="100000" value={unpaidValues[0]} oninput={(event) => { setRangeValue(unpaidValues, 0, event); syncRange(unpaidValues, 'minTotalUnpaid', 'maxTotalUnpaid', amountMax); }} aria-label="Minimum unpaid" />
          <input class="sf-input" type="number" min={unpaidValues[0]} max={amountMax} step="100000" value={unpaidValues[1] === amountMax ? '' : unpaidValues[1]} placeholder="No maximum" oninput={(event) => { setRangeValue(unpaidValues, 1, event); syncRange(unpaidValues, 'minTotalUnpaid', 'maxTotalUnpaid', amountMax); }} aria-label="Maximum unpaid" />
        </div>
      </div>

      <div class="flex flex-col gap-2 md:col-span-2">
        <div class="flex items-center justify-between text-[12px] text-ink-secondary"><span>Total paid</span><span>{label(paidValues, amountMax, true)}</span></div>
        <RangeSlider min={0} max={amountMax} step={100000} range bind:values={paidValues} onchange={() => syncRange(paidValues, 'minTotalPaid', 'maxTotalPaid', amountMax)} />
        <div class="grid grid-cols-2 gap-2">
          <input class="sf-input" type="number" min="0" max={paidValues[1]} step="100000" value={paidValues[0]} oninput={(event) => { setRangeValue(paidValues, 0, event); syncRange(paidValues, 'minTotalPaid', 'maxTotalPaid', amountMax); }} aria-label="Minimum paid" />
          <input class="sf-input" type="number" min={paidValues[0]} max={amountMax} step="100000" value={paidValues[1] === amountMax ? '' : paidValues[1]} placeholder="No maximum" oninput={(event) => { setRangeValue(paidValues, 1, event); syncRange(paidValues, 'minTotalPaid', 'maxTotalPaid', amountMax); }} aria-label="Maximum paid" />
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <button type="button" class="sf-btn-secondary" onclick={onReset}>Reset</button>
      <button type="submit" class="sf-btn-primary">Apply</button>
    </div>
  </form>
</Modal>
