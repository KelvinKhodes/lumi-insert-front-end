<script>
  import { onMount } from 'svelte';
  import { Plus, LoaderCircle, TriangleAlert, Pencil, Power, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { getCategories, activateCategory, deactivateCategory } from '../api/categories.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import CategoryFormModal from './CategoryFormModal.svelte';

  pageTitle.set('Categories');

  const categories = useAsyncAction(getCategories);
  const toggling = useAsyncAction(async (category) =>
    category.isActive ? deactivateCategory(category.id) : activateCategory(category.id)
  );

  let page = 0;
  const size = 12;

  let modalOpen = false;
  let editingCategory = null;

  function load() {
    categories.run({ page, size, sortBy: 'name', sortDirection: 'ASC' });
  }

  function goToPage(delta) {
    page = Math.max(0, page + delta);
    load();
  }

  function openCreate() {
    editingCategory = null;
    modalOpen = true;
  }

  function openEdit(category) {
    editingCategory = category;
    modalOpen = true;
  }

  async function onToggle(category) {
    await toggling.run(category);
    load();
  }

  onMount(load);
</script>

<div class="p-5 md:p-7">
  <div class="mb-5 flex items-center justify-between">
    <h1 class="hidden text-[22px] font-semibold text-ink md:block">Categories</h1>
    <button class="sf-btn-primary ml-auto" on:click={openCreate}>
      <Plus size={14} />New category
    </button>
  </div>

  {#if $categories.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $categories.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$categories.error.message}
    </div>
  {:else if !$categories.data?.content?.length}
    <div class="sf-card flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p class="text-[13.5px] text-ink-secondary">No categories yet.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {#each $categories.data.content as category (category.id)}
        <div class="sf-card flex items-center justify-between p-3.5">
          <div class="min-w-0">
            <p class="truncate text-[13.5px] font-medium text-ink">{category.name}</p>
            <p class="text-[12px] text-ink-secondary">{category.totalItems ?? 0} products</p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <span class="mr-1 rounded-full px-2 py-0.5 text-[11px] font-medium {category.isActive ? 'bg-success-soft text-success' : 'bg-black/[0.06] text-ink-secondary'}">
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
            <button class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]" on:click={() => openEdit(category)} aria-label="Edit">
              <Pencil size={14} />
            </button>
            <button
              class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]"
              on:click={() => onToggle(category)}
              disabled={$toggling.loading}
              aria-label={category.isActive ? 'Deactivate' : 'Activate'}
            >
              <Power size={14} class={category.isActive ? 'text-danger' : 'text-success'} />
            </button>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-4 flex items-center justify-between">
      <span class="text-[12px] text-ink-secondary">Page {page + 1}</span>
      <div class="flex gap-2">
        <button class="sf-btn-secondary !px-2.5" on:click={() => goToPage(-1)} disabled={$categories.data.first}>
          <ChevronLeft size={14} />
        </button>
        <button class="sf-btn-secondary !px-2.5" on:click={() => goToPage(1)} disabled={$categories.data.last}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  {/if}
</div>

<CategoryFormModal
  open={modalOpen}
  category={editingCategory}
  onClose={() => (modalOpen = false)}
  onSaved={load}
/>
