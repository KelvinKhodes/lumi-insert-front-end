<script> 
  import Modal from './Modal.svelte'; 

  /**
   * @typedef {Object} Props
   * @property {boolean} [open]
   * @property {any} [memo]
   * @property {any} [onClose]
   */

  /** @type {Props} */
  let { open = false, onClose = () => {} } = $props();
   

</script>

<Modal {open} {onClose} title="Welcome, Recruiter! 👋" maxWidthClass="max-w-[740px]">
 
    <div class="space-y-4 text-sm leading-relaxed text-gray-600">
      <p>
        Thanks for checking out my project! As a <strong class="text-gray-900 font-semibold">Backend Engineer</strong>, my main focus here is system architecture, observability, and robust API design, so the frontend UI is kept simple and straightforward.
      </p>
 
      <div>
        <h4 class="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Quick Notes Before You Explore</h4>
        <ul class="list-disc list-inside space-y-1 pl-1">
          <li><strong class="text-gray-800">Performance:</strong> You might notice slight latencies on some pages due to the heavy background monitoring stack running on limited demo infrastructure.</li>
          <li><strong class="text-gray-800">API Integration:</strong> The current UI showcases core workflows, but some backend endpoints are still being hooked up to the frontend.</li>
        </ul>
      </div>
 
      <div>
        <h4 class="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Under Active Development (Upcoming Backend Features)</h4>
        <ul class="list-disc list-inside space-y-1 pl-1">
          <li><strong class="text-gray-800">Activity Logging:</strong> Service is live; currently wiring up data retrieval.</li>
          <li><strong class="text-gray-800">Advanced Filtering:</strong> Fully built on backend APIs, pending FE integration.</li>
          <li><strong class="text-gray-800">Export System:</strong> XLSX/PDF generation (experimental phase).</li>
          <li><strong class="text-gray-800">Redis Caching:</strong> Architectural concept ready, implementation in progress.</li>
        </ul>
      </div> 
      <div class="rounded-lg bg-sky-50 border border-sky-200 p-4 mt-4">
        <h4 class="text-xs font-bold uppercase tracking-wider text-sky-800 mb-2">Demo Credentials</h4>
        <div class="space-y-1 text-xs sm:text-sm text-sky-950 font-mono">
          <div>
            <span class="font-sans font-semibold text-gray-700">Lumi:</span> 
            <span class="bg-sky-100 border border-sky-200 px-1.5 py-0.5 rounded text-sky-900">SUPERADMIN</span> | 
            <span class="bg-sky-100 border border-sky-200 px-1.5 py-0.5 rounded text-sky-900">SUPERADMIN123!</span>
          </div>
          <div>
            <span class="font-sans font-semibold text-gray-700">Grafana:</span> 
            <span class="bg-sky-100 border border-sky-200 px-1.5 py-0.5 rounded text-sky-900">guest</span> | 
            <span class="bg-sky-100 border border-sky-200 px-1.5 py-0.5 rounded text-sky-900">guest</span>
          </div>
        </div>
      </div>
    </div>
 
    <div class="mt-6 flex justify-end">
      <button onclick={onClose} id="closeModalBtn" class="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow transition duration-200 active:scale-95">
        Got it, let me explore!
      </button>
    </div>
</Modal>
