<script>
  import { run, preventDefault } from 'svelte/legacy';

  import { LoaderCircle, TriangleAlert, Check, KeyRound, ImagePlus } from 'lucide-svelte';
  import Modal from './Modal.svelte';
  import { createEmployee, updateEmployee, getEmployee, resetEmployeePassword, uploadEmployeeProfile, isUsernameTaken } from '../api/employees.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
    import { action, allowed } from '../permission';
    import { session } from '../stores/session';

  
  /**
   * @typedef {Object} Props
   * @property {string|null} [employeeId]
   * @property {boolean} [open]
   * @property {any} [onClose]
   * @property {any} [onSaved]
   */

  /** @type {Props} */
  let {
    employeeId = null,
    open = false,
    onClose = () => {},
    onSaved = () => {}
  } = $props();

  let isEdit = $derived(!!employeeId);

  const detail = useAsyncAction(getEmployee);
  const saving = useAsyncAction(async (payload) => {
    if (!isEdit) {
      const taken = await isUsernameTaken(payload.username);
      if (taken) throw new Error(`Username "${payload.username}" is already taken.`);
      return createEmployee(payload);
    }
    return updateEmployee(employeeId, payload);
  });
  const resetting = useAsyncAction((password) => resetEmployeePassword(employeeId, password));
  const uploading = useAsyncAction((file) => uploadEmployeeProfile(employeeId, file));

  let username = $state('');
  let fullname = $state('');
  let password = $state('');
  let joinDate = $state(new Date().toISOString().slice(0, 10));
  let role = $state('CASHIER');
  let isActive = $state(true);

  let newPassword = $state('');
  let profileFile = $state(null);

  run(() => {
    if (open) {
      saving.reset();
      resetting.reset();
      uploading.reset();
      newPassword = '';
      profileFile = null;
      if (isEdit) {
        detail.run(employeeId).then((data) => {
          username = data.username ?? '';
          fullname = data.fullname ?? '';
          role = data.role ?? 'CASHIER';
          isActive = true;
        });
      } else {
        detail.reset();
        username = '';
        fullname = '';
        password = '';
        joinDate = new Date().toISOString().slice(0, 10);
        role = 'CASHIER';
      }
    }
  });

  async function onSubmit() {
    const payload = isEdit
      ? { username, fullname, role, isActive }
      : { username, fullname, password, joinDate: `${joinDate}T00:00:00` };
    try {
      await saving.run(payload);
      onSaved();
      onClose();
    } catch {
      // error state already surfaced via $saving.error above
    }
  }

  async function onResetPassword() {
    if (!newPassword) return;
    await resetting.run(newPassword);
    newPassword = '';
  }

  async function onUploadProfile() {
    if (!profileFile) return;
    await uploading.run(profileFile);
    profileFile = null;
  }
</script>
{#if allowed($session?.employee?.role, action.EmployeesWrite)}
  <Modal {open} {onClose} title={isEdit ? 'Edit employee' : 'New employee'} maxWidthClass="max-w-[460px]">
    {#if isEdit && detail.loading}
      <div class="flex justify-center py-10"><LoaderCircle size={20} class="animate-spin text-ink-tertiary" /></div>
    {:else}
      <form onsubmit={preventDefault(onSubmit)} class="flex flex-col gap-3.5">
        {#if $saving.error}
          <div class="flex items-start gap-2 rounded-control bg-danger-soft px-3 py-2 text-[12.5px] text-danger">
            <TriangleAlert size={15} class="mt-0.5 shrink-0" />
            <span>{$saving.error.message}</span>
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="e-username" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Username</label>
            <input id="e-username" class="sf-input" type="text" pattern={"[a-zA-Z0-9]{5,30}"} bind:value={username} required />
          </div>
          <div>
            <label for="e-fullname" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Full name</label>
            <input id="e-fullname" class="sf-input" type="text" bind:value={fullname} required />
          </div>
        </div>

        {#if !isEdit}
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="e-password" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Password</label>
              <input id="e-password" class="sf-input" type="password" bind:value={password} required />
              <p class="mt-1 text-[11px] text-ink-tertiary">Min. 5 chars, incl. 1 special character</p>
            </div>
            <div>
              <label for="e-joindate" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Join date</label>
              <input id="e-joindate" class="sf-input" type="date" bind:value={joinDate} required />
            </div>
          </div>
        {:else}
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="e-role" class="mb-1.5 block text-[12.5px] font-medium text-ink-secondary">Role</label>
              <select id="e-role" class="sf-input" bind:value={role}>
                <option value="CASHIER">Cashier</option>
                <option value="FINANCE">Finance</option>
                <option value="WAREHOUSE">Warehouse</option>
              </select>
            </div>
            <label class="flex items-end gap-2 pb-2 text-[13px] text-ink">
              <input type="checkbox" class="h-4 w-4 rounded accent-accent" bind:checked={isActive} />
              Active employee
            </label>
          </div>
        {/if}

        <div class="mt-1 flex justify-end gap-2">
          <button type="button" class="sf-btn-secondary" onclick={onClose}>Cancel</button>
          <button type="submit" class="sf-btn-primary" disabled={$saving.loading}>
            {#if $saving.loading}
              <LoaderCircle size={14} class="animate-spin" />
            {/if}
            {isEdit ? 'Save changes' : 'Create employee'}
          </button>
        </div>
      </form>

      {#if isEdit}
        <div class="mt-5 flex flex-col gap-4 border-t border-hairline pt-4">
          <div>
            <p class="mb-2 flex items-center gap-1.5 text-[12.5px] font-medium text-ink-secondary">
              <KeyRound size={13} />Reset password
            </p>
            {#if $resetting.error}<p class="mb-2 text-[12px] text-danger">{$resetting.error.message}</p>{/if}
            {#if $resetting.success}<p class="mb-2 flex items-center gap-1 text-[12px] text-success"><Check size={13} />Password reset.</p>{/if}
            <div class="flex items-center gap-2">
              <input class="sf-input flex-1" type="password" placeholder="New password" bind:value={newPassword} />
              <button type="button" class="sf-btn-secondary shrink-0" onclick={onResetPassword} disabled={!newPassword || $resetting.loading}>
                {#if $resetting.loading}<LoaderCircle size={14} class="animate-spin" />{:else}Reset{/if}
              </button>
            </div>
          </div>

          <div>
            <p class="mb-2 flex items-center gap-1.5 text-[12.5px] font-medium text-ink-secondary">
              <ImagePlus size={13} />Profile photo
            </p>
            {#if $uploading.error}<p class="mb-2 text-[12px] text-danger">{$uploading.error.message}</p>{/if}
            {#if $uploading.success}<p class="mb-2 flex items-center gap-1 text-[12px] text-success"><Check size={13} />Uploaded.</p>{/if}
            <div class="flex items-center gap-2">
              <input type="file" accept="image/*" class="sf-input flex-1 !py-1.5 text-[12px]" onchange={(e) => (profileFile = e.currentTarget.files?.[0] ?? null)} />
              <button type="button" class="sf-btn-secondary shrink-0" onclick={onUploadProfile} disabled={!profileFile || $uploading.loading}>
                {#if $uploading.loading}<LoaderCircle size={14} class="animate-spin" />{:else}Upload{/if}
              </button>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </Modal>
{/if}