<script lang="ts">
  import { navigate } from '../lib/router'

  export let orderId: string

  $: reference = orderId.slice(0, 8).toUpperCase()
</script>

<section class="confirmation">
  <p class="check" aria-hidden="true">&#10003;</p>
  <h1>Thank you for your order</h1>
  <p>Your order reference is <strong>{reference}</strong>. We have your details and will contact you by email to confirm shipping.</p>
  <button on:click={() => navigate('/')}>Continue shopping</button>
</section>

<style>
  .confirmation {
    max-width: 560px;
    margin: 0 auto;
    padding: 64px 24px;
    text-align: center;
    color: #0d0d0d;
    line-height: 1.5;
    animation: rise 400ms ease-out;
  }
  .check {
    width: 64px;
    height: 64px;
    margin: 0 auto 24px;
    border-radius: 50%;
    background: #e6efe4;
    color: #2e6b3a;
    font-size: 2rem;
    line-height: 64px;
  }
  h1 {
    margin: 0 0 16px;
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 3vw, 2.25rem);
    line-height: 1.2;
  }
  button {
    margin-top: 24px;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    background: #0d0d0d;
    color: #ffffff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: background 200ms;
  }
  button:hover {
    background: #333333;
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
