<script>
  export let id, label, validationMsg, value = "";
</script>

<div class="form-group">
  <label for={id}>{label}</label>
  <input id={id} class="form-control" bind:value />
  {#if validationMsg}
    <span role="alert">{validationMsg}</span>
  {/if}
</div>