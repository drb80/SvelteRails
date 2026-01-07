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
