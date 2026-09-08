<script> 
    import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import Modal from './Modal.svelte'; 
  import useEmblaCarousel from 'embla-carousel-svelte'

  
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
    product = null, 
    open = false,
    onClose = () => {}, 
  } = $props();

  let currentIndex = $state(0);

  let translateX = $derived(-(currentIndex * 100) + '%'); 
  let options = { loop: false }
  
</script>

<Modal {open} {onClose} title={product?.name? product.name : 'Product Images'}>
    <div class="embla flex flex-col gap-2 flex-2 max-h-[70vh] min-h-0">
        <div
            class="embla__viewport h-[70vh]" 
            use:useEmblaCarousel={{ options }}
        >
            <div class="embla__container h-full min-h-0 relative transition-transform duration-300 ease-out" style="transform: translateX({translateX});">
                {#each product.pictureUrl as pictureUrl}
                    <div class="embla__slide" >
                        <img src={pictureUrl} alt="Product" class="rounded-sm w-full h-auto max-h-full object-contain mb-2 rounded-md" />
                    </div>
                {/each}
            </div>
        </div>

        <div class="flex-1 flex justify-center gap-4 h-[20%]">
            <button class="embla__prev" onclick={() => currentIndex--} disabled={currentIndex === 0}>
                <ChevronLeft size={20} />
            </button>
            <button class="embla__next" onclick={() => currentIndex++} disabled={currentIndex === product.pictureUrl.length - 1}>
                <ChevronRight size={20} />
            </button>
        </div>
    </div>
</Modal>
