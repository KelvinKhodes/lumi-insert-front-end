<script>
  import { onMount } from 'svelte';
  import {
    Plus,
    Search,
    LoaderCircle,
    TriangleAlert,
    Pencil,
    Power,
    ChevronLeft,
    ChevronRight
  } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { getProductsByFilter, activateProduct, deactivateProduct } from '../api/products.js';
  import { getCategories } from '../api/categories.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import ProductFormModal from './ProductFormModal.svelte';

  pageTitle.set('Products');

  const products = useAsyncAction(getProductsByFilter);
  const categoriesAction = useAsyncAction(getCategories);
  const toggling = useAsyncAction(async (product) =>
    product.isActive ? deactivateProduct(product.id) : activateProduct(product.id)
  );

  let page = 0;
  const size = 10;
  let nameQuery = '';
  let categoryId = '';
  let sortBy = 'createdAt';
  let sortDirection = 'DESC';

  let modalOpen = false;
  let editingProduct = null;

  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  function load() {
    products.run({
      page,
      size,
      sortBy,
      sortDirection,
      name: nameQuery || undefined,
      categoryId: categoryId || undefined
    });
  }

  function onSearch() {
    page = 0;
    load();
  }

  function onCategoryChange() {
    page = 0;
    load();
  }

  function goToPage(delta) {
    page = Math.max(0, page + delta);
    load();
  }

  function openCreate() {
    editingProduct = null;
    modalOpen = true;
  }

  function openEdit(product) {
    editingProduct = product;
    modalOpen = true;
  }

  async function onToggle(product) {
    await toggling.run(product);
    load();
  }

  onMount(() => {
    categoriesAction.run({ size: 100 });
    load();
  });
</script>

<div class="p-5 md:p-7">
  <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <h1 class="hidden text-[22px] font-semibold text-ink md:block">Products</h1>

    <form on:submit|preventDefault={onSearch} class="flex flex-1 flex-wrap items-center gap-2 md:justify-end">
      <div class="relative flex-1 md:max-w-[220px]">
        <Search size={14} class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
        <input class="sf-input pl-8" type="text" placeholder="Search products" bind:value={nameQuery} />
      </div>

      <select class="sf-input w-auto max-w-[160px]" bind:value={categoryId} on:change={onCategoryChange}>
        <option value="">All categories</option>
        {#each $categoriesAction.data?.content ?? [] as category (category.id)}
          <option value={category.id}>{category.name}</option>
        {/each}
      </select>

      <button type="submit" class="sf-btn-secondary shrink-0">Search</button>
      <button type="button" class="sf-btn-primary shrink-0" on:click={openCreate}>
        <Plus size={14} />New product
      </button>
    </form>
  </div>

  {#if $products.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $products.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$products.error.message}
    </div>
  {:else if !$products.data?.content?.length}
    <div class="sf-card flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p class="text-[13.5px] text-ink-secondary">No products found.</p>
    </div>
  {:else}
    <!-- desktop table -->
    <div class="sf-card hidden overflow-hidden md:block">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr class="border-b border-hairline text-[11.5px] uppercase tracking-wide text-ink-secondary">
            <th class="px-4 py-2.5 font-medium">Name</th>
            <th class="px-4 py-2.5 font-medium">Category</th>
            <th class="px-4 py-2.5 font-medium">Base price</th>
            <th class="px-4 py-2.5 font-medium">Sell price</th>
            <th class="px-4 py-2.5 font-medium">Stock</th>
            <th class="px-4 py-2.5 font-medium">Status</th>
            <th class="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {#each $products.data.content as product (product.id)}
            <tr class="border-b border-hairline last:border-0 hover:bg-black/[0.015]">
              <td class="px-4 py-2.5 font-medium text-ink">{product.name}</td>
              <td class="px-4 py-2.5 text-ink-secondary">{product.category?.name ?? '—'}</td>
              <td class="px-4 py-2.5 font-mono text-ink-secondary">{currency.format(product.basePrice)}</td>
              <td class="px-4 py-2.5 font-mono text-ink">{currency.format(product.sellPrice)}</td>
              <td class="px-4 py-2.5">
                <span class="{product.stockQuantity <= product.stockMinimum ? 'text-danger' : 'text-ink'} font-mono">
                  {product.stockQuantity}
                </span>
              </td>
              <td class="px-4 py-2.5">
                <span class="rounded-full px-2 py-0.5 text-[11px] font-medium {product.isActive ? 'bg-success-soft text-success' : 'bg-black/[0.06] text-ink-secondary'}">
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td class="px-4 py-2.5">
                <div class="flex justify-end gap-1">
                  <button class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]" on:click={() => openEdit(product)} aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                  <button
                    class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]"
                    on:click={() => onToggle(product)}
                    disabled={$toggling.loading}
                    aria-label={product.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Power size={14} class={product.isActive ? 'text-danger' : 'text-success'} />
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- mobile cards -->
    <div class="flex flex-col gap-2.5 md:hidden">
      {#each $products.data.content as product (product.id)}
        <div class="sf-card p-3.5">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate text-[13.5px] font-medium text-ink">{product.name}</p>
              <p class="text-[12px] text-ink-secondary">{product.category?.name ?? 'Uncategorized'}</p>
            </div>
            <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium {product.isActive ? 'bg-success-soft text-success' : 'bg-black/[0.06] text-ink-secondary'}">
              {product.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div class="mt-2.5 flex items-center justify-between text-[12.5px]">
            <span class="font-mono text-ink">{currency.format(product.sellPrice)}</span>
            <span class="font-mono {product.stockQuantity <= product.stockMinimum ? 'text-danger' : 'text-ink-secondary'}">
              {product.stockQuantity} in stock
            </span>
          </div>
          <div class="mt-3 flex gap-2">
            <button class="sf-btn-secondary flex-1 !py-1.5" on:click={() => openEdit(product)}>
              <Pencil size={13} />Edit
            </button>
            <button class="sf-btn-secondary flex-1 !py-1.5" on:click={() => onToggle(product)} disabled={$toggling.loading}>
              <Power size={13} class={product.isActive ? 'text-danger' : 'text-success'} />
              {product.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-4 flex items-center justify-between">
      <span class="text-[12px] text-ink-secondary">Page {page + 1}</span>
      <div class="flex gap-2">
        <button class="sf-btn-secondary !px-2.5" on:click={() => goToPage(-1)} disabled={$products.data.first}>
          <ChevronLeft size={14} />
        </button>
        <button class="sf-btn-secondary !px-2.5" on:click={() => goToPage(1)} disabled={$products.data.last}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  {/if}
</div>

<ProductFormModal
  open={modalOpen}
  product={editingProduct}
  categories={$categoriesAction.data?.content ?? []}
  onClose={() => (modalOpen = false)}
  onSaved={load}
/>
