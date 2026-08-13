<script>
  import { onMount } from 'svelte';
  import { Plus, LoaderCircle, TriangleAlert, Archive, Circle } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { getMemos, markMemoAsRead, archiveMemo } from '../api/memos.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import MemoFormModal from './MemoFormModal.svelte';

  pageTitle.set('Memos');

  const memos = useAsyncAction(getMemos);
  const archiving = useAsyncAction(archiveMemo);

  let modalOpen = false;
  let expandedId = null;

  const roleStyle = {
    OWNER: 'bg-danger-soft text-danger',
    FINANCE: 'bg-info-soft text-info',
    CASHIER: 'bg-accent-soft text-accent',
    WAREHOUSE: 'bg-warning-soft text-warning'
  };

  function load() {
    memos.run({});
  }

  async function onOpenMemo(memo) {
    expandedId = expandedId === memo.id ? null : memo.id;
    if (!memo.isRead) {
      try {
        await markMemoAsRead(memo.id);
        memo.isRead = true;
      } catch {
        // silently ignore — read-state is a soft signal, not worth surfacing an error for
      }
    }
  }

  async function onArchive(memo, event) {
    event.stopPropagation();
    await archiving.run(memo.id);
    load();
  }

  onMount(load);
</script>

<div class="p-5 md:p-7">
  <div class="mb-5 flex items-center justify-between">
    <h1 class="hidden text-[22px] font-semibold text-ink md:block">Memos</h1>
    <button class="sf-btn-primary ml-auto" on:click={() => (modalOpen = true)}>
      <Plus size={14} />New memo
    </button>
  </div>

  {#if $memos.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $memos.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$memos.error.message}
    </div>
  {:else if !$memos.data?.content?.length}
    <div class="sf-card flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p class="text-[13.5px] text-ink-secondary">No memos in the last month.</p>
    </div>
  {:else}
    <div class="flex flex-col gap-2.5">
      {#each $memos.data.content as memo (memo.id)}
        <button class="sf-card block w-full p-4 text-left" on:click={() => onOpenMemo(memo)}>
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-start gap-2">
              {#if !memo.isRead}
                <Circle size={7} class="mt-1.5 shrink-0 fill-accent text-accent" />
              {:else}
                <span class="mt-1.5 w-[7px] shrink-0"></span>
              {/if}
              <div class="min-w-0">
                <p class="truncate text-[13.5px] font-medium text-ink">{memo.title}</p>
                <p class="text-[12.5px] text-ink-secondary" class:line-clamp-1={expandedId !== memo.id}>
                  {memo.body}
                </p>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              {#if memo.role}
                <span class="rounded-full px-2 py-0.5 text-[11px] font-medium {roleStyle[memo.role] ?? 'bg-black/[0.06] text-ink-secondary'}">
                  {memo.role}
                </span>
              {/if}
              <button
                class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05] hover:text-danger"
                on:click={(e) => onArchive(memo, e)}
                disabled={$archiving.loading}
                aria-label="Archive"
              >
                <Archive size={14} />
              </button>
            </div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<MemoFormModal open={modalOpen} onClose={() => (modalOpen = false)} onSaved={load} />
