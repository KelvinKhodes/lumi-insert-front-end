<script>
  import { Router, Route } from 'svelte-routing';
  import { session } from './lib/stores/session.js';
  import AppShell from './lib/components/AppShell.svelte';
  import Login from './lib/components/Login.svelte';
  import Dashboard from './lib/components/Dashboard.svelte';
  import Products from './lib/components/Products.svelte';
  import Categories from './lib/components/Categories.svelte';
  import Customers from './lib/components/Customers.svelte';
  import Employees from './lib/components/Employees.svelte';
  import Suppliers from './lib/components/Suppliers.svelte';
  import StockCards from './lib/components/StockCards.svelte';
  import Memos from './lib/components/Memos.svelte';
  import Supplies from './lib/components/Supplies.svelte';
  import SupplyCreate from './lib/components/SupplyCreate.svelte';
  import SupplyDetail from './lib/components/SupplyDetail.svelte';
  import Transactions from './lib/components/Transactions.svelte';
  import TransactionCreate from './lib/components/TransactionCreate.svelte';
  import TransactionDetail from './lib/components/TransactionDetail.svelte';

  export let url = '';

  $: isAuthenticated = !!$session?.accessToken;
</script>

<Router {url}>
  {#if !isAuthenticated}
    <Login />
  {:else}
    <AppShell>
      <Route path="/"><Dashboard /></Route>
      <Route path="/products"><Products /></Route>
      <Route path="/categories"><Categories /></Route>
      <Route path="/customers"><Customers /></Route>
      <Route path="/employees"><Employees /></Route>
      <Route path="/suppliers"><Suppliers /></Route>
      <Route path="/supplies"><Supplies /></Route>
      <Route path="/supplies/new"><SupplyCreate /></Route>
      <Route path="/supplies/:id" let:params><SupplyDetail id={params.id} /></Route>
      <Route path="/transactions"><Transactions /></Route>
      <Route path="/transactions/new"><TransactionCreate /></Route>
      <Route path="/transactions/:id" let:params><TransactionDetail id={params.id} /></Route>
      <Route path="/stock-cards"><StockCards /></Route>
      <Route path="/memos"><Memos /></Route>
    </AppShell>
  {/if}
</Router>
