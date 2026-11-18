<script lang="ts">
  import { auth, signOut } from '../../lib/auth'
  import AdminLoginPage from './AdminLoginPage.svelte'
  import AdminProductsPage from './AdminProductsPage.svelte'
  import AdminOrdersPage from './AdminOrdersPage.svelte'

  export let section: 'products' | 'orders'
</script>

{#if !$auth.ready}
  <p class="status">Loading...</p>
{:else if !$auth.session || !$auth.isAdmin}
  <AdminLoginPage signedIn={$auth.session !== null} />
{:else}
  <nav class="admin-nav">
    <a href="#/admin" class:active={section === 'products'}>Products</a>
    <a href="#/admin/orders" class:active={section === 'orders'}>Orders</a>
    <button on:click={signOut}>Sign out</button>
  </nav>
  {#if section === 'orders'}
    <AdminOrdersPage />
  {:else}
    <AdminProductsPage />
  {/if}
{/if}

<style>
  .status {
    padding: 64px 24px;
    text-align: center;
    color: #5c5852;
  }
  .admin-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 24px;
    max-width: 960px;
    margin: 0 auto;
    padding: 16px 24px 0;
  }
  .admin-nav a {
    padding-bottom: 4px;
    color: #5c5852;
    text-decoration: none;
    border-bottom: 2px solid transparent;
    transition: color 200ms, border-color 200ms;
  }
  .admin-nav a:hover,
  .admin-nav a.active {
    color: #0d0d0d;
    border-bottom-color: #0d0d0d;
  }
  .admin-nav button {
    margin-left: auto;
    padding: 6px 14px;
    border: 1px solid #0d0d0d;
    border-radius: 8px;
    background: transparent;
    color: #0d0d0d;
    font: inherit;
    cursor: pointer;
    transition: background 200ms, color 200ms;
  }
  .admin-nav button:hover {
    background: #0d0d0d;
    color: #ffffff;
  }
</style>
