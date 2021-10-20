<script>
  import axios from 'axios';
  import Input from '../components/Input.svelte';
  
  let username, email, password, confPw;
  let requestInProgress = false;
  let signUpSuccess = false;
  $: pwMismatch = password !== confPw;
  $: disabled = (password) ? pwMismatch : true; 

  $: {
    if(username){};
    errors.username = "";
  }
  
  $: {
    if(email){};
    errors.email = "";
  }
  
  $: {
    if(password){};
    errors.password = "";
  }
  
  let errors = {};

  const submit = () => {
    requestInProgress = true;
    axios.post('/api/1.0/users', { username, email, password })
      .then(() => {
        signUpSuccess = true;
      })
      .catch((error) => {
        if(error.response.status === 400) {
          errors = error.response.data.validationErrors;
        }
        requestInProgress = false;
      });
  }
  
</script>

{#if !signUpSuccess}
<div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2" data-testid="sign-up-form">
  <form class="card mt-5">
    <div class="card-header">
      <h1 class="text-center">Sign Up</h1>
    </div>
  
    <div class="card-body">
      <Input id="username" label="Username" validationMsg={errors.username} bind:value={username} />
      <Input id="email" label="Email" validationMsg={errors.email} bind:value={email} />
      <Input id="password" label="Password" type="password" validationMsg={errors.password} bind:value={password} />
      <Input id="confirm-password" label="Confirm password" type="password" validationMsg={pwMismatch ? "Password mismatch" : ""} bind:value={confPw} />
    
      <div class="text-center">
        <button disabled={disabled || requestInProgress} class="btn btn-primary" on:click|preventDefault={submit}>
          {#if requestInProgress }
            <span class="spinner-border spinner-border-sm" 
            data-testid="spinner"
            role="status" 
            aria-hidden="true"></span >
          {/if}
          Sign Up
        </button>
      </div>
    </div>
  </form>
</div>
{:else}
  <div class="alert alert-success mt-3" role="alert">Please check your email to activate your account.</div>
{/if}