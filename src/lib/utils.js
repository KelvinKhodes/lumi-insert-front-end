/**
 * Triggers a browser download for a Blob returned by an export endpoint
 * (PDF invoices, XLSX history exports).
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function formatCurrency(amount) {
  const res = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
  console.log(res);
  return res;
}

/**
 * Applies a Cloudinary face-focused avatar transformation to a delivery URL.
 * Non-Cloudinary URLs are returned unchanged.
 * @param {string|null|undefined} url
 * @param {number} [size=200]
 */
export function cloudinaryAvatarUrl(url, size = 200) {
  if (!url || !url.includes('/image/upload/')) return url ?? '';
  const transformation = `c_thumb,g_face,h_${size},w_${size}/r_max/f_auto/q_auto`;
  return url.replace('/image/upload/', `/image/upload/${transformation}/`);
}
