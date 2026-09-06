<script>
  import RangeSlider from 'svelte-range-slider-pips';
  import Modal from './Modal.svelte';

  /**
   * @typedef {Object} Props
   * @property {boolean} [open]
   * @property {() => void} [onClose]
   * @property {() => void} [onApply]
   * @property {() => void} [onReset]
   * @property {Record<string, any>} [filters]
   */

  /** @type {Props} */
  let {
    open = false,
    onClose = () => {},
    onApply = () => {},
    onReset = () => {},
    filters = {}
  } = $props();

  const transactionMax = 1000;
  const amountMax = 100000000;
  let transactionValues = $state([0, transactionMax]);
  let unpaidValues = $state([0, amountMax]);
  let paidValues = $state([0, amountMax]);
  let previousFilters = $state();

  function valueOrDefault(value, fallback) {
    return value === '' || value == null ? fallback : Number(value);
  }

  function syncRange(values, minKey, maxKey) {
    filters[minKey] = values[0] === 0 ? '' : values[0];
    filters[maxKey] = values[1] === (minKey === 'minTotalTransaction' ? transactionMax : amountMax) ? '' : values[1];
  }

  function setRangeValue(values, index, event) {
    const value = Math.max(0, Number(event.currentTarget.value) || 0);
    values[index] = value;
  }

  $effect(() => {
    if (filters !== previousFilters) {
      previousFilters = filters;
      transactionValues = [
        valueOrDefault(filters.minTotalTransaction, 0),
        valueOrDefault(filters.maxTotalTransaction, transactionMax)
      ];
      unpaidValues = [
        valueOrDefault(filters.minTotalUnpaid, 0),
        valueOrDefault(filters.maxTotalUnpaid, amountMax)
      ];
      paidValues = [
        valueOrDefault(filters.minTotalPaid, 0),
        valueOrDefault(filters.maxTotalPaid, amountMax)
      ];
    }
  });
</script>

<Modal open={open} title="Advanced customer filters" onClose={onClose} maxWidthClass="max-w-[760px]">
  <form class="space-y-4" onsubmit={(event) => { event.preventDefault(); onApply(); }}>
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        Name
        <input class="sf-input" type="text" bind:value={filters.name} placeholder="Customer name" />
      </label>

      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        Email
        <input class="sf-input" type="email" bind:value={filters.email} placeholder="customer@example.com" />
      </label>

      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        Contact
        <input class="sf-input" type="text" bind:value={filters.contact} placeholder="Phone number" />
      </label>

      <label class="flex flex-col gap-1 text-[12px] text-ink-secondary">
        Status
        <select class="sf-input" bind:value={filters.isActive}>
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </label>

      <div class="flex flex-col gap-2 md:col-span-2 xl:col-span-3">
        <div class="flex items-center justify-between text-[12px] text-ink-secondary">
          <span>Total transactions</span>
          <span>{transactionValues[0]} - {transactionValues[1] === transactionMax ? 'Any' : transactionValues[1]}</span>
        </div>
        <RangeSlider min={0} max={transactionMax} range bind:values={transactionValues} on:change={() => syncRange(transactionValues, 'minTotalTransaction', 'maxTotalTransaction')} />
        <div class="grid grid-cols-2 gap-2">
          <input class="sf-input" type="number" min="0" max={transactionValues[1]} value={transactionValues[0]} oninput={(event) => { setRangeValue(transactionValues, 0, event); syncRange(transactionValues, 'minTotalTransaction', 'maxTotalTransaction'); }} aria-label="Minimum transactions" />
          <input class="sf-input" type="number" min={transactionValues[0]} max={transactionMax} value={transactionValues[1] === transactionMax ? '' : transactionValues[1]} placeholder="No maximum" oninput={(event) => { setRangeValue(transactionValues, 1, event); syncRange(transactionValues, 'minTotalTransaction', 'maxTotalTransaction'); }} aria-label="Maximum transactions" />
        </div>
      </div>

      <div class="flex flex-col gap-2 md:col-span-2 xl:col-span-3">
        <div class="flex items-center justify-between text-[12px] text-ink-secondary">
          <span>Total unpaid</span>
          <span>Rp {unpaidValues[0].toLocaleString('id-ID')} - {unpaidValues[1] === amountMax ? 'Any' : `Rp ${unpaidValues[1].toLocaleString('id-ID')}`}</span>
        </div>
        <RangeSlider min={0} max={amountMax} step={100000} range bind:values={unpaidValues} on:change={() => syncRange(unpaidValues, 'minTotalUnpaid', 'maxTotalUnpaid')} />
        <div class="grid grid-cols-2 gap-2">
          <input class="sf-input" type="number" min="0" max={unpaidValues[1]} step="100000" value={unpaidValues[0]} oninput={(event) => { setRangeValue(unpaidValues, 0, event); syncRange(unpaidValues, 'minTotalUnpaid', 'maxTotalUnpaid'); }} aria-label="Minimum unpaid" />
          <input class="sf-input" type="number" min={unpaidValues[0]} max={amountMax} step="100000" value={unpaidValues[1] === amountMax ? '' : unpaidValues[1]} placeholder="No maximum" oninput={(event) => { setRangeValue(unpaidValues, 1, event); syncRange(unpaidValues, 'minTotalUnpaid', 'maxTotalUnpaid'); }} aria-label="Maximum unpaid" />
        </div>
      </div>

      <div class="flex flex-col gap-2 md:col-span-2 xl:col-span-3">
        <div class="flex items-center justify-between text-[12px] text-ink-secondary">
          <span>Total paid</span>
          <span>Rp {paidValues[0].toLocaleString('id-ID')} - {paidValues[1] === amountMax ? 'Any' : `Rp ${paidValues[1].toLocaleString('id-ID')}`}</span>
        </div>
        <RangeSlider min={0} max={amountMax} step={100000} range bind:values={paidValues} on:change={() => syncRange(paidValues, 'minTotalPaid', 'maxTotalPaid')} />
        <div class="grid grid-cols-2 gap-2">
          <input class="sf-input" type="number" min="0" max={paidValues[1]} step="100000" value={paidValues[0]} oninput={(event) => { setRangeValue(paidValues, 0, event); syncRange(paidValues, 'minTotalPaid', 'maxTotalPaid'); }} aria-label="Minimum paid" />
          <input class="sf-input" type="number" min={paidValues[0]} max={amountMax} step="100000" value={paidValues[1] === amountMax ? '' : paidValues[1]} placeholder="No maximum" oninput={(event) => { setRangeValue(paidValues, 1, event); syncRange(paidValues, 'minTotalPaid', 'maxTotalPaid'); }} aria-label="Maximum paid" />
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <button type="button" class="sf-btn-secondary" onclick={onReset}>Reset</button>
      <button type="submit" class="sf-btn-primary">Apply</button>
    </div>
  </form>
</Modal>
