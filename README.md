    rails new SvelteRails --api
    cd SvelteRails
    rails g scaffold Item what when:date
    rails db:migrate
    rails db:seed

Create a default route.

    Rails.application.routes.draw do
      resources :items
      root "items#index"
    end

Overlay a Svelte app.

    npx sv create --template minimal --types ts --install npm .

Here is what is created.

    src
    ├── app.d.ts
    ├── app.html
    ├── lib
    │   ├── api.ts
    │   ├── assets
    │   │   └── favicon.svg
    │   └── index.ts
    └── routes
        ├── +layout.svelte
        ├── +layout.ts
        └── +page.svelte


Make src/lib/api.ts look like the following.

    export interface Item {
      id?: number;
      what: string;
      when: string;
    }

    const API_URL = 'http://localhost:3000';

    export async function getItems(): Promise<Item[]> {
      const response = await fetch(`${API_URL}/items`);
      if (!response.ok) throw new Error('Failed to fetch items');
      return response.json();
    }

    export async function getItem(id: number): Promise<Item> {
      const response = await fetch(`${API_URL}/items/${id}`);
      if (!response.ok) throw new Error('Failed to fetch item');
      return response.json();
    }

    export async function createItem(item: Omit<Item, 'id'>): Promise<Item> {
      const response = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!response.ok) throw new Error('Failed to create item');
      return response.json();
    }

    export async function updateItem(id: number, item: Omit<Item, 'id'>): Promise<Item> {
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!response.ok) throw new Error('Failed to update item');
      return response.json();
    }

    export async function deleteItem(id: number): Promise<void> {
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete item');
    }

Make ```src/routes/+page_svelte``` look like.

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

<br/>

    npm install -D @sveltejs/adapter-static

Update ```svelte.config.js``` to create static pages.

    import adapter from '@sveltejs/adapter-static';
    import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

    /** @type {import('@sveltejs/kit').Config} */
    const config = {
        preprocess: vitePreprocess(),

        kit: {
            adapter: adapter({
                pages: 'build',
                assets: 'build',
                fallback: undefined,
                precompress: false,
                strict: true
            })
        }
    };

    export default config;

Create ```src/routes/+layout.ts``` with the following.

    export const prerender = true;
    export const ssr = false;
    export const trailingSlash = 'always';

Here is a tree view of what gets built.

    build/
    ├── _app
    │   ├── env.js
    │   ├── immutable
    │   │   ├── assets
    │   │   │   └── 2.DvNvAX5G.css
    │   │   ├── chunks
    │   │   │   ├── 0-MqESqi.js
    │   │   │   ├── 46vft45f.js
    │   │   │   ├── B8bJjLrw.js
    │   │   │   ├── BG113DiQ.js
    │   │   │   ├── BHIs7hwi.js
    │   │   │   ├── CJRWyrcJ.js
    │   │   │   ├── DCubpxHF.js
    │   │   │   ├── yIDQwdGA.js
    │   │   │   └── ZGXG3O0-.js
    │   │   ├── entry
    │   │   │   ├── app.BxxNVJZu.js
    │   │   │   └── start.DFbO-oR7.js
    │   │   └── nodes
    │   │       ├── 0.DdPABvte.js
    │   │       ├── 1.Dk2RXuwB.js
    │   │       └── 2.4w0spv--.js
    │   └── version.json
    ├── index.html
    └── robots.txt

Copy the results to the static rails directory.

    cp -Rf build/* public

You can now run ```rails server``` and surf to ```localhost:3000```.

If you want to run dynamically, you'll need a CORS extension.

    bundle add rack-cors

In ```config/initializers/cors.rb```.

    Rails.application.config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins "localhost:5173"

        resource "*",
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head]
      end
    end

Now you can ```npm run dev --open```.

If wanted, add a Google font (https://fonts.google.com) to
```/src/routes/+layouts.svelte```.

    <style>
      :global(body) {
        font-family: 'Roboto', sans-serif;
      }
    </style>
