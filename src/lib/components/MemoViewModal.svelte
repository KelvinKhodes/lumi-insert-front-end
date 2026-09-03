<script> 
  import Modal from './Modal.svelte'; 

  /**
   * @typedef {Object} Props
   * @property {boolean} [open]
   * @property {any} [memo]
   * @property {any} [onClose]
   */

  /** @type {Props} */
  let { open = false, memo = null, onClose = () => {} } = $props();
  
 
</script>

<Modal {open} {onClose} title="{memo?.title}" maxWidthClass="max-w-[440px]">
  <p class="text-ink-secondary whitespace-pre-line">{memo?.body}</p>
  {#if memo?.images !== null}
    {#each memo?.images as image}
      <img src={image} alt="Memo attachment" class="mt-2 max-h-[300px] w-full object-contain" />
    {/each}
  {/if}
</Modal>
