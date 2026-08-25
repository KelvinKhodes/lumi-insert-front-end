<script>
  import { Link } from 'svelte-routing';
  import Logo from '../assets/Logo.png';
  import {
    LayoutDashboard,
    Box,
    Tag,
    Users,
    IdCard,
    Truck,
    PackagePlus,
    Receipt,
    ClipboardList,
    StickyNote,
    LogOut,
    X,

    Monitor,

    FileText,

    FileBracesCorner



  } from 'lucide-svelte';
  import { session, clearSession } from '../stores/session.js';
  import { logout } from '../api/auth.js';

  
  /**
   * @typedef {Object} Props
   * @property {boolean} [open] - Whether the mobile slide-over is open. Ignored on md+ where the sidebar is always visible.
   * @property {any} [onClose]
   */

  /** @type {Props} */
  let { open = false, onClose = () => {} } = $props();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/products', label: 'Products', icon: Box },
    { href: '/categories', label: 'Categories', icon: Tag },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/employees', label: 'Employees', icon: IdCard },
    { href: '/suppliers', label: 'Suppliers', icon: Truck },
    { href: '/supplies', label: 'Supplies', icon: PackagePlus },
    { href: '/transactions', label: 'Transactions', icon: Receipt },
    { href: '/stock-cards', label: 'Stock cards', icon: ClipboardList },
    { href: '/memos', label: 'Memos', icon: StickyNote },

  ];
  const navDeveloperItems = [
    { href: 'https:admin.lumi-insert.my.id', label: 'Grafana', icon: Monitor },
    { href: '/swagger-ui/index.html', label: 'Swagger', icon: FileText },
    { href: '/v3/api-docs', label: 'OpenAPI', icon: FileBracesCorner }
  ]
  

  /** svelte-routing Link `getProps` — styles the active route like macOS System Settings. */
  function linkProps({ isCurrent }) {
    const base =
      'flex items-center gap-2.5 rounded-control px-3 py-1.5 text-[13px] transition-colors duration-100';
    return {
      class: isCurrent
        ? `${base} bg-accent-soft text-accent font-medium`
        : `${base} text-ink dark:text-white/90 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]`
    };
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      clearSession();
    }
  }
</script>

<!-- mobile backdrop -->
{#if open}
  <button
    aria-label="Close navigation"
    class="fixed inset-0 z-40 bg-black/30 md:hidden"
    onclick={onClose}
  ></button>
{/if}

<aside
  class="fixed inset-y-0 left-0 z-50 w-[230px] shrink-0 -translate-x-full transform bg-sidebar backdrop-blur-sf transition-transform duration-200 ease-out md:static md:z-auto md:translate-x-0
    {open ? 'translate-x-0' : ''}"
>
  <div class="flex h-full flex-col border-r border-hairline justify-between p-3">
    <div>
      <div class="flex items-center justify-between px-1 pb-4 pt-1">
        <div class="flex items-center gap-2">
          <div class="h-6 w-6 rounded-[7px]">
            <img class="h-full w-full object-contain drop-shadow-[0_0px_0px_rgba(0,0,0,6)]" src={Logo} alt="Lumi Insert Logo">
          </div>
          <span class="text-[14px] font-semibold text-ink">Lumi Insert</span>
        </div>
        <button class="rounded-control p-1 text-ink-secondary hover:bg-black/[0.05] md:hidden" onclick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div>
        <nav class="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {#each navItems as item}
            <Link to={item.href} getProps={linkProps} on:click={onClose}>
              <item.icon size={16} strokeWidth={2} />
              {item.label}
            </Link>
          {/each}
        </nav>
        <nav class="flex flex-1 flex-col gap-0.5 border-t-2 border-gray-200 overflow-y-auto">
          {#each navDeveloperItems as item} 
            <a class="flex items-center gap-2.5 rounded-control px-3 py-1.5 text-[13px] transition-colors duration-100" target="_blank"  href={item.href}>
              <item.icon size={16} strokeWidth={2} />
              {item.label}
            </a>
          {/each}
        </nav>
      </div>
    </div>
    
    
    

    

    <div class="mt-2 border-t border-hairline pt-3">
      <div class="flex items-center gap-2 rounded-control px-2 py-1.5">
        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-[11px] font-medium text-accent">
          {($session?.employee?.fullname ?? '?').slice(0, 2).toUpperCase()}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-[12.5px] font-medium text-ink">{$session?.employee?.fullname ?? 'Unknown'}</p>
          <p class="truncate text-[11px] text-ink-secondary">{$session?.employee?.role ?? ''}</p>
        </div>
        <button
          class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05] hover:text-danger"
          onclick={handleLogout}
          aria-label="Log out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  </div>
</aside>
