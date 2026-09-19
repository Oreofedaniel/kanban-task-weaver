import { api } from './api';

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

export async function fetchUsers(): Promise<AppUser[]> {
  const { data } = await api.get<Array<{ _id: string; name: string; email: string }>>('/users');
  return data.map((u) => ({ id: u._id, name: u.name, email: u.email }));
}
