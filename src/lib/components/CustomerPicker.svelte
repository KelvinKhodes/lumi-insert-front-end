<script>
  import { Search, LoaderCircle } from 'lucide-svelte';
  import { searchCustomerNames } from '../api/customers.js';

  export let onSelect = (/** @type {{id:string,name:string}} */ customer) => {};
  export let placeholder = 'Search a customer…';

  let query = '';
  let results = [];
  let open = false;
  let loading = false;
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
        const data = await searchCustomerNames({ name: query, size: 8 });
        results = data.content ?? [];
      } catch {
        results = [];
      } finally {
        loading = false;
      }
    }, 300);
  }

  function pick(customer) {
    onSelect(customer);
    query = customer.name;
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
      on:input={onInput}
      on:focus={() => (open = true)}
    />
    {#if loading}
      <LoaderCircle size={14} class="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-ink-tertiary" />
    {/if}
  </div>

  {#if open && results.length > 0}
    <ul class="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-control border border-hairline bg-surface p-1 shadow-popover">
      {#each results as customer (customer.id)}
        <li>
          <button
            type="button"
            class="block w-full truncate rounded-[7px] px-2.5 py-1.5 text-left text-[13px] text-ink hover:bg-black/[0.05]"
            on:click={() => pick(customer)}
          >
            {customer.name}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<svelte:window on:click={(e) => {
  if (open && !e.target.closest('.relative')) open = false;
}} />
