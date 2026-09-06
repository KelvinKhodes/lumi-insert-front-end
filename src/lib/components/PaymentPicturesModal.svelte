<script>
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import Modal from './Modal.svelte';

  /** @typedef {Object} Props
   * @property {boolean} [open]
   * @property {string[]} [pictureUrl]
   * @property {() => void} [onClose]
   * @property {string} [title]
   */

  /** @type {Props} */
  let { open = false, pictureUrl = [], onClose = () => {}, title = 'Payment pictures' } = $props();
  let currentIndex = $state(0);

  function pictures() {
    return Array.isArray(pictureUrl) ? pictureUrl.filter(Boolean) : [];
  }

  function selectPicture(index) {
    currentIndex = Math.max(0, Math.min(index, pictures().length - 1));
  }

  $effect(() => {
    if (currentIndex >= pictures().length) currentIndex = Math.max(0, pictures().length - 1);
  });
</script>

<Modal {open} {onClose} title={title} maxWidthClass="max-w-[620px]">
  <div class="flex flex-col gap-4">
    <div class="relative flex aspect-square max-h-[560px] items-center justify-center overflow-hidden rounded-control bg-black/[0.04]">
      <img src={pictures()[currentIndex]} alt={`Payment picture ${currentIndex + 1}`} class="h-full w-full object-contain" />
      {#if pictures().length > 1}
        <button type="button" class="absolute left-3 rounded-full bg-black/55 p-2 text-white disabled:opacity-30" onclick={() => selectPicture(currentIndex - 1)} disabled={currentIndex === 0} aria-label="Previous payment picture">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button type="button" class="absolute right-3 rounded-full bg-black/55 p-2 text-white disabled:opacity-30" onclick={() => selectPicture(currentIndex + 1)} disabled={currentIndex === pictures().length - 1} aria-label="Next payment picture">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      {/if}
    </div>

    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      {#each pictures() as picture, index (picture)}
        <button type="button" class="h-16 w-16 shrink-0 overflow-hidden rounded-control border-2 {currentIndex === index ? 'border-accent' : 'border-transparent'}" onclick={() => selectPicture(index)} aria-label={`View payment picture ${index + 1}`} aria-pressed={currentIndex === index}>
          <img src={picture} alt="" class="h-full w-full object-cover" />
        </button>
      {/each}
    </div>
  </div>
</Modal>
