<script>
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import { uploadCustomerPictures } from '../api/customers.js';
  import { allowed, action } from '../permission.js';
  import { session } from '../stores/session.js';
  import { ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, TriangleAlert, Upload, X } from 'lucide-svelte';
  import Modal from './Modal.svelte';

  /** @typedef {Object} Props
   * @property {string} customerId
   * @property {string[]} [pictureUrl]
   * @property {() => void} [onUploaded]
   */

  /** @type {Props} */
  let { customerId, pictureUrl = [], onUploaded = () => {} } = $props();

  const maxImageSize = 8 * 1024 * 1024;
  const maxImageCount = 5;
  const uploading = useAsyncAction((files) => uploadCustomerPictures(customerId, files));
  let currentIndex = $state(0);
  let uploadOpen = $state(false);
  let selectedFiles = $state([]);
  let previewUrls = $state([]);
  let imageError = $state('');

  function pictures() {
    return Array.isArray(pictureUrl) ? pictureUrl.filter(Boolean) : [];
  }

  function selectPicture(index) {
    currentIndex = Math.max(0, Math.min(index, pictures().length - 1));
  }

  function clearUploadSelection() {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    previewUrls = [];
    selectedFiles = [];
    imageError = '';
  }

  function closeUpload() {
    clearUploadSelection();
    uploading.reset();
    uploadOpen = false;
  }

  function onFileSelected(event) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    imageError = '';
    if (!files.length) return;
    if (files.length > maxImageCount) {
      imageError = `You can upload up to ${maxImageCount} images at a time.`;
      return;
    }
    const invalidFile = files.find((file) => !file.type.startsWith('image/'));
    if (invalidFile) {
      imageError = `${invalidFile.name} is not an image.`;
      return;
    }
    const oversizedFile = files.find((file) => file.size > maxImageSize);
    if (oversizedFile) {
      imageError = `${oversizedFile.name} exceeds the 8 MB image limit.`;
      return;
    }
    clearUploadSelection();
    selectedFiles = files;
    previewUrls = files.map((file) => URL.createObjectURL(file));
  }

  async function upload() {
    if (!selectedFiles.length) return;
    await uploading.run(selectedFiles);
    closeUpload();
    onUploaded();
  }
</script>

<div class="sf-card rounded-tl-none p-4">
  {#if pictures().length === 0}
    <div class="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center">
      <ImagePlus size={30} class="text-ink-tertiary" aria-hidden="true" />
      <div>
        <p class="text-[13.5px] font-medium text-ink">No customer pictures yet</p>
        <p class="mt-1 text-[12px] text-ink-secondary">Add a picture to this customer profile.</p>
      </div>
      {#if allowed($session?.employee?.role, action.CustomersWrite)}
        <button type="button" class="sf-btn-primary" onclick={() => (uploadOpen = true)}>
          <Upload size={14} aria-hidden="true" />Upload picture
        </button>
      {/if}
    </div>
  {:else}
    <div class="flex flex-col gap-4">
      <div class="relative flex aspect-square max-h-[560px] items-center justify-center overflow-hidden rounded-control bg-black/[0.04]">
        <img src={pictures()[currentIndex]} alt={`Customer picture ${currentIndex + 1}`} class="h-full w-full object-contain" />
        {#if pictures().length > 1}
          <button type="button" class="absolute left-3 rounded-full bg-black/55 p-2 text-white disabled:opacity-30" onclick={() => selectPicture(currentIndex - 1)} disabled={currentIndex === 0} aria-label="Previous picture">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" class="absolute right-3 rounded-full bg-black/55 p-2 text-white disabled:opacity-30" onclick={() => selectPicture(currentIndex + 1)} disabled={currentIndex === pictures().length - 1} aria-label="Next picture">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        {/if}
      </div>

      <div class="flex items-center gap-2 overflow-x-auto pb-1">
        {#each pictures() as picture, index (picture)}
          <button type="button" class="h-16 w-16 shrink-0 overflow-hidden rounded-control border-2 {currentIndex === index ? 'border-accent' : 'border-transparent'}" onclick={() => selectPicture(index)} aria-label={`View picture ${index + 1}`} aria-pressed={currentIndex === index}>
            <img src={picture} alt="" class="h-full w-full object-cover" />
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<Modal open={uploadOpen} onClose={closeUpload} title="Upload customer picture">
  <div class="flex flex-col gap-3.5">
    {#if $uploading.error}
      <div class="flex items-start gap-2 rounded-control bg-danger-soft px-3 py-2 text-[12.5px] text-danger" role="alert">
        <TriangleAlert size={15} class="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{$uploading.error.message}</span>
      </div>
    {/if}
    <label for="customer-picture" class="text-[12.5px] font-medium text-ink-secondary">Picture</label>
    <input id="customer-picture" class="sf-input !py-1.5 text-[12px]" type="file" accept="image/*" multiple onchange={onFileSelected} />
    {#if previewUrls.length}
      <div class="grid grid-cols-3 gap-2">
        {#each previewUrls as previewUrl (previewUrl)}
          <div class="aspect-square overflow-hidden rounded-control bg-surface-muted">
            <img src={previewUrl} alt="" class="h-full w-full object-cover" />
          </div>
        {/each}
      </div>
    {/if}
    {#if imageError}<p class="text-[12px] text-danger" role="alert">{imageError}</p>{/if}
    {#if selectedFiles.length}<p class="text-[12px] text-ink-secondary">{selectedFiles.length} image{selectedFiles.length === 1 ? '' : 's'} selected.</p>{/if}
    <p class="text-[11px] text-ink-tertiary">Up to 5 images, maximum 8 MB each.</p>
    <div class="flex justify-end gap-2">
      <button type="button" class="sf-btn-secondary" onclick={closeUpload}>Cancel</button>
      <button type="button" class="sf-btn-primary" onclick={upload} disabled={!selectedFiles.length || $uploading.loading}>
        {#if $uploading.loading}<LoaderCircle size={14} class="animate-spin" />{:else}<Upload size={14} aria-hidden="true" />{/if}
        Upload
      </button>
    </div>
  </div>
</Modal>
