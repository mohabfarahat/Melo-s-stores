<script lang="ts">
  import { joinAsOwner, signIn, signOut } from '../../lib/auth'

  export let signedIn: boolean

  let mode: 'sign-in' | 'join' = 'sign-in'
  let email = ''
  let password = ''
  let inviteCode = ''
  let submitting = false
  let errorMessage = ''
  let noticeMessage = ''

  async function submit() {
    submitting = true
    errorMessage = ''
    noticeMessage = ''
    try {
      const error =
        mode === 'sign-in'
          ? await signIn(email.trim(), password)
          : await joinAsOwner(email.trim(), password, inviteCode.trim())
      if (error) errorMessage = error
    } catch {
      errorMessage = 'Network problem. Check your connection and try again.'
    } finally {
      submitting = false
    }
  }

  function switchMode(next: 'sign-in' | 'join') {
    mode = next
    errorMessage = ''
    noticeMessage = ''
    password = ''
    inviteCode = ''
  }
</script>

<section class="login">
  {#if signedIn}
    <h1>Almost there</h1>
    <p>This account does not have store owner access yet. Ask the store owner for an invite code, or sign in with the owner account.</p>
    <button class="secondary" on:click={signOut}>Sign out</button>
  {:else if mode === 'sign-in'}
    <h1>Sign in</h1>
    <form on:submit|preventDefault={submit}>
      <label>
        Email
        <input type="email" bind:value={email} required maxlength="254" autocomplete="email" />
      </label>
      <label>
        Password
        <input type="password" bind:value={password} required maxlength="72" autocomplete="current-password" />
      </label>

      {#if errorMessage}
        <p class="error" role="alert">{errorMessage}</p>
      {/if}

      <button type="submit" class="primary" disabled={submitting}>
        {submitting ? 'Please wait...' : 'Sign in'}
      </button>
    </form>
    <button class="toggle" on:click={() => switchMode('join')}>
      First time? Join with your invite code
    </button>
  {:else}
    <h1>Join as store owner</h1>
    <p class="intro">Enter the invite code you were given to create your owner account.</p>
    <form on:submit|preventDefault={submit}>
      <label>
        Invite code
        <input type="text" bind:value={inviteCode} required maxlength="100" autocomplete="off" />
      </label>
      <label>
        Email
        <input type="email" bind:value={email} required maxlength="254" autocomplete="email" />
      </label>
      <label>
        Password (at least 8 characters)
        <input type="password" bind:value={password} required minlength="8" maxlength="72" autocomplete="new-password" />
      </label>

      {#if errorMessage}
        <p class="error" role="alert">{errorMessage}</p>
      {/if}

      <button type="submit" class="primary" disabled={submitting}>
        {submitting ? 'Please wait...' : 'Create owner account'}
      </button>
    </form>
    <button class="toggle" on:click={() => switchMode('sign-in')}>
      Already joined? Sign in
    </button>
  {/if}
</section>

<style>
  .login {
    max-width: 420px;
    margin: 0 auto;
    padding: 64px 24px;
    color: #0d0d0d;
  }
  h1 {
    margin: 0 0 16px;
    font-family: var(--font-display);
    font-size: 1.75rem;
    line-height: 1.2;
  }
  .intro {
    margin: 0 0 16px;
    color: #5c5852;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    background: #ffffff;
    border: 1px solid #e6e4df;
    border-radius: 16px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  input {
    padding: 10px 12px;
    border: 1px solid #bdb8af;
    border-radius: 8px;
    font: inherit;
  }
  input:focus {
    outline: 2px solid #0d0d0d;
    outline-offset: 1px;
  }
  .primary,
  .secondary {
    padding: 12px 20px;
    border-radius: 8px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: background 200ms;
  }
  .primary {
    border: none;
    background: #0d0d0d;
    color: #ffffff;
  }
  .primary:hover:not(:disabled) {
    background: #333333;
  }
  .primary:disabled {
    opacity: 0.7;
    cursor: wait;
  }
  .secondary {
    border: 1px solid #0d0d0d;
    background: transparent;
    color: #0d0d0d;
  }
  .secondary:hover {
    background: #0d0d0d;
    color: #ffffff;
  }
  .toggle {
    margin-top: 16px;
    border: none;
    background: none;
    color: #0d0d0d;
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }
  .error {
    margin: 0;
    color: #9b2c2c;
  }
</style>
