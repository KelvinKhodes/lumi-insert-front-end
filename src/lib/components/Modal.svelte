<script>
  import { fade, scale } from 'svelte/transition';
  import { X } from 'lucide-svelte';

  /**
   * @typedef {Object} Props
   * @property {boolean} [open]
   * @property {string} [title]
   * @property {any} [onClose]
   * @property {string} [maxWidthClass]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let {
    open = false,
    title = '',
    onClose = () => {},
    maxWidthClass = 'max-w-[440px]',
    children
  } = $props();

  let dialogRef = $state(null);
  let previousActiveElement = $state(null);

  function handleKeydown(e) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Tab') {
      handleTabTrap(e);
    }
  }

  function handleTabTrap(e) {
    if (!dialogRef) return;
    
    const focusableElements = dialogRef.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  }

  $effect(() => {
    if (open) {
      previousActiveElement = document.activeElement;
      setTimeout(() => {
        const firstFocusable = dialogRef?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 0);
    } else if (previousActiveElement && previousActiveElement.focus) {
      previousActiveElement.focus();
    }
  });
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
  <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <button
      aria-label="Close dialog"
      class="fixed inset-0 bg-black/35"
      transition:fade={{ duration: 120 }}
      onclick={onClose}
    ></button>

    <div
      bind:this={dialogRef}
      class="app-window relative w-full {maxWidthClass} max-h-[85vh] overflow-y-auto"
      transition:scale={{ duration: 140, start: 0.96, opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div class="sticky top-0 z-10 flex items-center justify-between border-b border-hairline bg-surface px-5 py-3.5">
        <h2 class="text-[15px] font-semibold text-ink">{title}</h2>
        <button class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]" onclick={onClose} aria-label="Close">
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div class="p-5">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}
