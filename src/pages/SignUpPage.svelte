<script>
  import axios from 'axios';
  import Input from '../components/Input.svelte';
  
  let username, email, password, confPw;
  let requestInProgress = false;
  let signUpSuccess = false;
  $: disabled = (password) ? password !== confPw : true; 
  
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
      <!-- <div class="form-group">
        <label for="username">Username</label>
        <input id="username" class="form-control" bind:value={username} />
        {#if errors.username}
          <span role="alert">{errors.username}</span>
        {/if}
      </div> -->
    
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" class="form-control" bind:value={email} />
      </div>
    
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" class="form-control" type="password" bind:value={password} />
      </div>
    
      <div class="form-group">
        <label for="confirm-password">Confirm password</label>
        <input id="confirm-password" class="form-control" type="password" bind:value={confPw} />
      </div>
    
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