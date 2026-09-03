<script>
  import { onMount } from 'svelte';
  import { Plus, LoaderCircle, TriangleAlert, ChevronLeft, ChevronRight, ChevronRight as Arrow } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  import { getEmployees } from '../api/employees.js';
  import { useAsyncAction } from '../api/useAsyncAction.js';
  import EmployeeFormModal from './EmployeeFormModal.svelte';
    import { action, allowed } from '../permission.js';
    import { session } from '../stores/session.js';

  pageTitle.set('Employees');

  const employees = useAsyncAction(getEmployees);

  let page = $state(0);
  const size = 12;

  let modalOpen = $state(false);
  let editingEmployeeId = $state(null);

  const roleStyle = {
    FINANCE: 'bg-info-soft text-info',
    CASHIER: 'bg-accent-soft text-accent',
    WAREHOUSE: 'bg-warning-soft text-warning'
  };

  function load() {
    employees.run({ page, size, sortBy: 'createdAt', sortDirection: 'ASC' });
  }

  function goToPage(delta) {
    page = Math.max(0, page + delta);
    load();
  }

  function openCreate() {
    editingEmployeeId = null;
    modalOpen = true;
  }

  function openEdit(id) {
    editingEmployeeId = id;
    modalOpen = true;
  }

  onMount(load);
</script>

<div class="p-5 md:p-7">
  <div class="mb-5 flex items-center justify-between">
    <h1 class="hidden text-[22px] font-semibold text-ink md:block">Employees</h1>
    {#if allowed($session?.employee?.role, action.EmployeesWrite)}
    <button class="sf-btn-primary ml-auto" onclick={openCreate}>
      <Plus size={14} aria-hidden="true" />New employee
    </button>
    {/if}
  </div>

  {#if $employees.loading}
    <div class="flex justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $employees.error}
    <div class="flex items-center gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$employees.error.message}
    </div>
  {:else if !$employees.data?.content?.length}
    <div class="sf-card flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p class="text-[13.5px] text-ink-secondary">No employees yet.</p>
    </div>
  {:else}
    <div class="sf-card overflow-hidden">
      <ul class="divide-y divide-hairline">
        {#each $employees.data.content as employee (employee.id)}
          <li>
            <button
              class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-black/[0.015]"
              disabled={!allowed($session?.employee?.role, action.EmployeesWrite)}
              onclick={() => openEdit(employee.id)}
            >
              <div class="flex min-w-0 items-center gap-3">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-medium text-accent">
                  {employee.fullname.slice(0, 2).toUpperCase()}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-[13.5px] font-medium text-ink">{employee.fullname}</p>
                  <p class="truncate text-[12px] text-ink-secondary">@{employee.username}</p>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <span class="rounded-full px-2 py-0.5 text-[11px] font-medium {roleStyle[employee.role] ?? 'bg-black/[0.06] text-ink-secondary'}">
                  {employee.role}
                </span>
                <Arrow size={15} class="text-ink-tertiary" />
              </div>
            </button>
          </li>
        {/each}
      </ul>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <span class="text-[12px] text-ink-secondary">Page {page + 1}</span>
      <div class="flex gap-2">
        <button class="sf-btn-secondary !px-2.5" onclick={() => goToPage(-1)} disabled={$employees.data.first}>
          <ChevronLeft size={14} />
        </button>
        <button class="sf-btn-secondary !px-2.5" onclick={() => goToPage(1)} disabled={$employees.data.last}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  {/if}
</div>

<EmployeeFormModal
  open={modalOpen}
  employeeId={editingEmployeeId}
  onClose={() => (modalOpen = false)}
  onSaved={load}
/>
