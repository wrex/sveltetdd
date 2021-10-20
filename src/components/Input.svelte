<script>
  export let id = "", label ="", validationMsg = "", value = "";

  let inputClass = validationMsg ? "form-control is-invalid" : "form-control";
</script>

<div class="form-group">
  <label for={id}>{label}</label>
  <input id={id} 
    class="form-control" 
    class:is-invalid={validationMsg}
    bind:value />
  {#if validationMsg}
    <span class="invalid-feedback" role="alert">{validationMsg}</span>
  {/if}
</div>