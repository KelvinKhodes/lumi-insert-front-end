import { writable } from 'svelte/store';

/**
 * Wraps any async API function (from the modules in src/lib/api/*.js) into a
 * Svelte store that tracks { loading, error, success, data }, so every
 * screen gets the required loading/error/success handling for free instead
 * of re-implementing it per call-site.
 *
 * Usage inside a .svelte component:
 *
 *   import { createProduct } from '$lib/api/products.js';
 *   import { useAsyncAction } from '$lib/api/useAsyncAction.js';
 *
 *   const creating = useAsyncAction(createProduct);
 *
 *   async function onSubmit() {
 *     await creating.run({ name, basePrice, sellPrice, stockQuantity });
 *   }
 *
 *   // in the markup: {#if $creating.loading} ... {/if}
 *   //                {#if $creating.error}   {$creating.error.message} {/if}
 *   //                {#if $creating.success} Saved!                    {/if}
 *
 * @template {(...args: any[]) => Promise<any>} Fn
 * @param {Fn} fn
 */
export function useAsyncAction(fn) {
  const initial = { loading: false, error: null, success: false, data: null };
  const state = writable(initial);

  /** @type {(...args: Parameters<Fn>) => Promise<Awaited<ReturnType<Fn>>>} */
  async function run(...args) {
    state.set({ loading: true, error: null, success: false, data: null });
    try { 
      const data = await fn(...args);
      state.set({ loading: false, error: null, success: true, data });
      return data;
    } catch (error) {
      state.set({ loading: false, error, success: false, data: null });
      throw error;
    }
  }

  async function reload(data) {  
    try {  
      state.set({ loading: false, error: null, success: true, data: data });
      return data;
    } catch (error) {
      state.set({ loading: false, error, success: false, data: null });
      throw error;
    }
  }

  function reset() {
    state.set(initial);
  }

  return { subscribe: state.subscribe, run, reset, reload };
}
