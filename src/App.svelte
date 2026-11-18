<script lang="ts">
  import { route } from './lib/router'
  import SiteHeader from './lib/components/SiteHeader.svelte'
  import CartDrawer from './lib/components/CartDrawer.svelte'
  import ShopPage from './pages/ShopPage.svelte'
  import ProductPage from './pages/ProductPage.svelte'
  import CheckoutPage from './pages/CheckoutPage.svelte'
  import ConfirmationPage from './pages/ConfirmationPage.svelte'
  import AboutPage from './pages/AboutPage.svelte'
  import TrackPage from './pages/TrackPage.svelte'
  import AdminPage from './pages/admin/AdminPage.svelte'
</script>

<SiteHeader />
<main>
  {#if $route.name === 'shop'}
    <ShopPage />
  {:else if $route.name === 'product'}
    <ProductPage productId={$route.id} />
  {:else if $route.name === 'checkout'}
    <CheckoutPage />
  {:else if $route.name === 'confirmation'}
    <ConfirmationPage orderId={$route.orderId} />
  {:else if $route.name === 'about'}
    <AboutPage />
  {:else if $route.name === 'track'}
    <TrackPage />
  {:else if $route.name === 'admin'}
    <AdminPage section={$route.section} />
  {:else}
    <section class="not-found">
      <h1>Page not found</h1>
      <a href="#/">Back to the collection</a>
    </section>
  {/if}
</main>
<CartDrawer />

<style>
  main {
    min-height: calc(100vh - 72px);
  }
  .not-found {
    padding: 64px 24px;
    text-align: center;
    color: #0d0d0d;
  }
  .not-found a {
    color: #0d0d0d;
  }
</style>
