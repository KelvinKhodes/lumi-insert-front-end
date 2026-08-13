import { writable } from 'svelte/store';

/** Current page title, shown in the mobile top bar. Each page sets this on init. */
export const pageTitle = writable('Lumi Insert');
