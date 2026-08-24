<script>   
  import { Minus } from 'lucide-svelte';
  import Modal from './Modal.svelte';  
  import RangeSlider from 'svelte-range-slider-pips'  
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
    open = false,
    onClose = () => {}, 
    onReset = () => {},
    load = () => {},
    categories = [],
    payload = {}
  } = $props();
  
  let loading = $state(false);
  let values = $state([0, 50000000]); 

  const options = {
    sort_direction: [ 
      { id: "DESC", value: "Descending" },
      { id: "ASC", value: "Ascending" }
    ],
    sort_by: [ 
      { id: "createdAt", value: "Created At" },
      { id: "updatedAt", value: "Updated At" },
      { id: "sellPrice", value: "Sell Price" },
      { id: "basePrice", value: "Base Price" },
      { id: "stockQuantity", value: "Stock Quantity" }
    ]
  };

  function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID').format(value);
  }

  function handleMaxInput(e) {
    const rawValue = e.target.value; 
    const price = parseInt(rawValue.replace(/\D/g, ""), 10);
    if(price < values[0]) { 
      values[1] = values[0];
    } 
  }

  function handleValueInput(e, type){
    const rawValue = e.target.value; 

    if(isNaN(Number(rawValue.substr(rawValue.length - 1)))) { 
      e.target.value = rawValue.slice(0, -1);
    } 
    const price = parseInt(rawValue.replace(/\D/g, ""), 10);
    if(type === 'min') { 
      if(price > values[1]) { 
        e.target.value = rawValue.slice(0, -1);
        return;
      }
      values[0] = price;
    } else if (type === 'max') { 
      values[1] = price;
    } 
  }

  async function onSubmit(event) { 
    event.preventDefault(); 
    loading = true;
    payload.minPrice = Number(values[0]);
    payload.maxPrice = Number(values[1]);
    load();
    loading = false;
    onClose();
  }
   
</script>

<Modal {open} {onClose} title="Product Search"> 
  <form onsubmit={onSubmit} class="flex flex-col gap-3.5">
    <div class="relative flex flex-col flex-1 gap-2 bg-gray-50 p-4 rounded-xl">
        <label for="general">General</label>

        <input class="sf-input pl-2" type="text" placeholder="Product name" bind:value={payload.nameQuery} />

        <div class="relative flex-1"> 
          <select id="p-category" class="sf-input pl-2 {payload.categoryId === '' ? 'text-gray-400' : 'text-gray-900'}" bind:value={payload.categoryId}>
            <option class="text-gray-400" value="">Pick category</option>
            {#each categories as category (category.id)}
              <option class="text-gray-900" value={category.id}>{category.name}</option>
            {/each}
          </select>
        </div>
    </div> 
    

    <div class="mt-1 bg-gray-50 p-4 rounded-xl">
      <label for="priceRange"> Price</label> 
      <RangeSlider min={0} max={50000000} range pips bind:values />
      <div class="flex flex-row justify-between items-center text-[12px]">
        <div class="relative">
          <p class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary">Rp</p>
          <input class="sf-input pl-8" type="text" oninput={(e) => handleValueInput(e, 'min')} value={formatCurrency(values[0])}/>
        </div>

        <Minus size={23} />

        <div class="relative">
          <p class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary">Rp</p>
          <input  class="sf-input pl-8" type="text" onblur={(e) => handleMaxInput(e)} oninput={(e) => handleValueInput(e, 'max')} value={formatCurrency(values[1])} />
        </div> 
      </div>
    </div>
    
   <div class="relative flex flex-col flex-1 gap-2 mt-1 bg-gray-50 p-4 rounded-xl">
        <label for="general">Sort</label>

        <select id="sort-by" class="sf-input pl-8 {payload.sortBy === '' ? 'text-gray-400' : 'text-gray-900'}" bind:value={payload.sortBy}>
          {#each options.sort_by as by (by.id)}
            <option class="text-gray-900" value={by.id}>{by.value}</option>
          {/each}
        </select>
        <select id="sort-direction" class="sf-input pl-8 {payload.sortDirection === '' ? 'text-gray-400' : 'text-gray-900'}" bind:value={payload.sortDirection}>
          {#each options.sort_direction as direction (direction.id)}
            <option class="text-gray-900" value={direction.id}>{direction.value}</option>
          {/each}
        </select>
    </div>
    <div class="mt-2 flex justify-end gap-2">
      <button type="button" class="sf-btn-secondary" onclick={onClose}>Cancel</button>
      <button type="button" class="sf-btn-secondary" onclick={onReset}>Clear</button>
      <button type="submit" class="sf-btn-primary" disabled={loading}>
        {#if loading}
          <LoaderCircle size={14} class="animate-spin" />
        {/if}
        Search
      </button>
    </div>
  </form>  
</Modal>
