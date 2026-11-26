import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getUser, getDatabase } = vi.hoisted(() => ({
  getUser: vi.fn(),
  getDatabase: vi.fn(),
}));

vi.mock('../app/lib/server', () => ({
  createClient: async () => ({ auth: { getUser } }),
}));
vi.mock('../app/lib/database', () => ({ getDatabase }));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => { throw new Error('Redirect to ' + path); },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import {
  createCustomer,
  createInvoice,
  deleteCustomer,
  deleteInvoice,
  updateCustomer,
  updateInvoice,
} from '../app/lib/actions';
import { GET as query } from '../app/query/route';
import { GET as seed } from '../app/seed/route';

const id = 'unused-test-id';
const input = new FormData();

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user: null }, error: null });
});

describe('dashboard authorization', () => {
  it.each([
    ['create invoice', () => createInvoice({}, input)],
    ['update invoice', () => updateInvoice(id, input)],
    ['delete invoice', () => deleteInvoice(id)],
    ['create customer', () => createCustomer({}, input)],
    ['update customer', () => updateCustomer(id, {}, input)],
    ['delete customer', () => deleteCustomer(id)],
  ] as const)('redirects a signed-out user before attempting to %s', async (_, action) => {
    await expect(action()).rejects.toThrow('Redirect to /login');
    expect(getDatabase).not.toHaveBeenCalled();
  });

  it('allows a verified user to reach input validation', async () => {
    getUser.mockResolvedValue({ data: { user: { id } }, error: null });
    const result = await createInvoice({}, input);
    expect(result?.errors).toBeDefined();
    expect(getDatabase).not.toHaveBeenCalled();
  });

  it.each([['query', query], ['seed', seed]] as const)('retires the legacy %s route', (_, route) => {
    expect(route().status).toBe(404);
  });
});
