<script>
  import { onMount } from 'svelte';

  export let id = "", label ="", validationMsg = "", value = "", type = "text";

  let inputElement;
  onMount(() => {
    inputElement.type = type;
  });
</script>

<div class="form-group">
  <label for={id}>{label}</label>
  <input id={id} 
    bind:this={inputElement}
    class="form-control" 
    class:is-invalid={validationMsg}
    bind:value />
  {#if validationMsg}
    <span class="invalid-feedback" role="alert">{validationMsg}</span>
  {/if}
</div>