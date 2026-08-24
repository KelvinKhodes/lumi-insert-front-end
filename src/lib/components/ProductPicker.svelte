<script>
  import { Search, LoaderCircle } from 'lucide-svelte';
  import { searchProductNames } from '../api/products.js';

  /**
   * @typedef {Object} Props
   * @property {any} [onSelect]
   * @property {string} [placeholder]
   */

  /** @type {Props} */
  let { onSelect = (/** @type {{id:number,name:string}} */ product) => {}, placeholder = 'Search a product…', isButtonActiveWhenOutOfStock = false } = $props();

  let query = $state('');
  let results = $state([]);
  let open = $state(false);
  let loading = $state(false); 
  let debounceTimer;
  

  function onInput() {
    open = true;
    clearTimeout(debounceTimer);
    if (!query.trim()) {
      results = [];
      return;
    }
    debounceTimer = setTimeout(async () => {
      loading = true;
      try {
        const data = await searchProductNames({ name: query, size: 8 });
        results = data.content ?? [];
      } catch {
        results = [];
      } finally {
        loading = false;
      }
    }, 300);
  }

  function pick(product) { 
    onSelect(product); 
    query = product.name;
    open = false;
  }
</script>

<div class="relative">
  <div class="relative">
    <Search size={14} class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
    <input
      class="sf-input pl-8"
      type="text"
      {placeholder}
      bind:value={query}
      oninput={onInput}
      onfocus={() => (open = true)}
    />
    {#if loading}
      <LoaderCircle size={14} class="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-ink-tertiary" />
    {/if}
  </div>

  {#if open && results.length > 0}
    <ul class="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-control border border-hairline bg-surface p-1 shadow-popover">
      {#each results as product (product.id)}
        <li>
          <button
            type="button"
            disabled={!product.stockQuantity && !isButtonActiveWhenOutOfStock}
            class="block w-full truncate rounded-[7px] px-2.5 py-1.5 text-left text-[13px] text-ink hover:bg-black/[0.05]"
            onclick={() => pick(product)}
          >
            {product.name} {product.stockQuantity? "(" + product.stockQuantity + " Remaining)" : " (Out of stock)"}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<svelte:window onclick={(e) => {
  if (open && !e.target.closest('.relative')) open = false;
}} />
