<script lang="ts">
  import { onMount } from 'svelte';
  import { getItems, createItem, updateItem, deleteItem, type Item } from '$lib/api';

  let items: Item[] = [];
  let loading = false;
  let error = '';
  
  let formData = { what: '', when: '' };
  let editingId: number | null = null;

  onMount(async () => {
    await loadItems();
  });

  async function loadItems() {
    loading = true;
    error = '';
    try {
      items = await getItems();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load items';
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    if (!formData.what || !formData.when) {
      error = 'Please fill in all fields';
      return;
    }

    loading = true;
    error = '';
    try {
      if (editingId !== null) {
        await updateItem(editingId, formData);
        editingId = null;
      } else {
        await createItem(formData);
      }
      formData = { what: '', when: '' };
      await loadItems();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Operation failed';
    } finally {
      loading = false;
    }
  }

  function handleEdit(item: Item) {
    if (item.id !== undefined) {
      editingId = item.id;
      formData = { what: item.what, when: item.when };
    }
  }

  function cancelEdit() {
    editingId = null;
    formData = { what: '', when: '' };
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    loading = true;
    error = '';
    try {
      await deleteItem(id);
      await loadItems();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to delete item';
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  <h1>Items Manager</h1>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <form on:submit|preventDefault={handleSubmit} class="form">
    <div class="form-group">
      <label for="what">What:</label>
      <input
        id="what"
        type="text"
        bind:value={formData.what}
        placeholder="Enter description"
        disabled={loading}
      />
    </div>

    <div class="form-group">
      <label for="when">When:</label>
      <input
        id="when"
        type="date"
        bind:value={formData.when}
        disabled={loading}
      />
    </div>

    <div class="button-group">
      <button type="submit" disabled={loading}>
        {editingId !== null ? 'Update' : 'Create'}
      </button>
      {#if editingId !== null}
        <button type="button" on:click={cancelEdit} disabled={loading}>
          Cancel
        </button>
      {/if}
    </div>
  </form>

  <div class="items-list">
    <h2>Items</h2>
    {#if loading && items.length === 0}
      <p>Loading...</p>
    {:else if items.length === 0}
      <p>No items yet. Create one above!</p>
    {:else}
      <ul>
        {#each items as item (item.id)}
          <li>
            <div class="item-content">
              <strong>{item.what}</strong>
              <span>{new Date(item.when).toLocaleDateString()}</span>
            </div>
            <div class="item-actions">
              <button on:click={() => handleEdit(item)} disabled={loading}>
                Edit
              </button>
              <button
                on:click={() => item.id && handleDelete(item.id)}
                disabled={loading}
                class="delete"
              >
                Delete
              </button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    color: #333;
    margin-bottom: 2rem;
  }

  h2 {
    color: #555;
    margin-bottom: 1rem;
  }

  .error {
    background: #fee;
    color: #c33;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .form {
    background: #f5f5f5;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  button:hover:not(:disabled) {
    background: #0056b3;
  }

  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  button.delete {
    background: #dc3545;
  }

  button.delete:hover:not(:disabled) {
    background: #c82333;
  }

  .items-list ul {
    list-style: none;
    padding: 0;
  }

  .items-list li {
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .item-content span {
    color: #666;
    font-size: 0.9rem;
  }

  .item-actions {
    display: flex;
    gap: 0.5rem;
  }

  .item-actions button {
    padding: 0.25rem 0.75rem;
    font-size: 0.9rem;
  }
</style>
