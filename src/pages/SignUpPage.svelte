<script>
  import axios from 'axios';

  let username, email, password, confPw;
  let requestPromise;
  let signUpSuccess = false;
  $: disabled = (password) ? password !== confPw : true; 

  const submit = () => {
    disabled = true;
    requestPromise = axios.post('/api/1.0/users', { username, email, password });
    requestPromise.then(() => {
      signUpSuccess = true;
    }).catch((error) => {
      signUpSuccess = false;
    });
  }

</script>

<div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
  <form class="card mt-5">
    <div class="card-header">
      <h1 class="text-center">Sign Up</h1>
    </div>
  
    <div class="card-body">
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" class="form-control" bind:value={username} />
      </div>
    
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
        <button {disabled} class="btn btn-primary" on:click|preventDefault={submit}>
          {#await requestPromise }
            <span class="spinner-border spinner-border-sm" 
            data-testid="spinner"
            role="status" 
            aria-hidden="true"></span >
          {:catch error}
            &nbsp;
          {/await}
          Sign Up
        </button>
      </div>
    </div>
  </form>
  {#if signUpSuccess}
    <div class="alert alert-success" role="alert">Please check your email to activate your account.</div>
  {/if}
</div>