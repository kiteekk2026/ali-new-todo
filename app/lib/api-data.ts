import { getDatabase } from './database';
import { PostgresError } from 'postgres';

export type Resource = 'invoices' | 'customers';
export type InvoiceInput = {
  customerId: string;
  amountCents: number;
  status: 'pending' | 'paid';
};
export type CustomerInput = { name: string; email: string };
export type Input = InvoiceInput | CustomerInput;
export type Filters = { page: number; pageSize: number; q: string };

export class DataError extends Error {
  constructor(readonly status: 404 | 409, message: string) {
    super(message);
  }
}

export const apiData = {
  async list(resource: Resource, { page, pageSize, q }: Filters) {
    const sql = getDatabase();
    const pattern = '%' + q.replace(/[\\%_]/g, '\\$&') + '%';
    const offset = (page - 1) * pageSize;
    const [result] = resource === 'invoices'
      ? await sql`WITH matches AS (
          SELECT i.id, i.customer_id AS "customerId", i.amount AS "amountCents", i.status, i.date::text AS date
          FROM invoices i JOIN customers c ON c.id = i.customer_id
          WHERE c.name ILIKE ${pattern} OR c.email ILIKE ${pattern} OR i.status ILIKE ${pattern}
        )
        SELECT (SELECT count(*)::int FROM matches) AS total,
          COALESCE((SELECT json_agg(p ORDER BY p.date DESC, p.id) FROM
            (SELECT * FROM matches ORDER BY date DESC, id LIMIT ${pageSize} OFFSET ${offset}) p), '[]'::json) AS items`
      : await sql`WITH matches AS (
          SELECT id, name, email FROM customers WHERE name ILIKE ${pattern} OR email ILIKE ${pattern}
        )
        SELECT (SELECT count(*)::int FROM matches) AS total,
          COALESCE((SELECT json_agg(p ORDER BY p.name, p.id) FROM
            (SELECT * FROM matches ORDER BY name, id LIMIT ${pageSize} OFFSET ${offset}) p), '[]'::json) AS items`;
    return { items: result.items, total: result.total, page, pageSize };
  },

  async get(resource: Resource, id: string) {
    const sql = getDatabase();
    const [row] = resource === 'invoices'
      ? await sql`SELECT id, customer_id AS "customerId", amount AS "amountCents", status, date::text AS date FROM invoices WHERE id = ${id}`
      : await sql`SELECT id, name, email FROM customers WHERE id = ${id}`;
    return row;
  },

  async save(resource: Resource, body: Input, id?: string) {
    const sql = getDatabase();
    if (resource === 'customers' && 'name' in body) {
      try {
        const [row] = id
          ? await sql`UPDATE customers SET name = ${body.name}, email = ${body.email} WHERE id = ${id} RETURNING id, name, email`
          : await sql`INSERT INTO customers (name, email, image_url)
              VALUES (${body.name}, ${body.email}, '/customers/lee-robinson.png') RETURNING id, name, email`;
        return row;
      } catch (error) {
        if (error instanceof PostgresError && error.code === '23505') {
          throw new DataError(409, 'A customer with this email already exists.');
        }
        throw error;
      }
    }

    if (!('customerId' in body)) throw new Error('Invalid data layer input');
    return sql.begin(async tx => {
      // Serialize invoice writes with customer deletion even on older schemas without a foreign key.
      await tx`LOCK TABLE invoices IN ROW EXCLUSIVE MODE`;
      if (id && !(await tx`SELECT id FROM invoices WHERE id = ${id} FOR UPDATE`).length) return;
      if (!(await tx`SELECT id FROM customers WHERE id = ${body.customerId} FOR KEY SHARE`).length) {
        throw new DataError(404, 'Customer not found.');
      }
      const [row] = id
        ? await tx`UPDATE invoices SET customer_id = ${body.customerId}, amount = ${body.amountCents}, status = ${body.status}
            WHERE id = ${id} RETURNING id, customer_id AS "customerId", amount AS "amountCents", status, date::text AS date`
        : await tx`INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${body.customerId}, ${body.amountCents}, ${body.status}, CURRENT_DATE)
            RETURNING id, customer_id AS "customerId", amount AS "amountCents", status, date::text AS date`;
      return row;
    });
  },

  async remove(resource: Resource, id: string) {
    const sql = getDatabase();
    if (resource === 'invoices') return Boolean((await sql`DELETE FROM invoices WHERE id = ${id} RETURNING id`).length);
    return sql.begin(async tx => {
      await tx`LOCK TABLE invoices IN SHARE ROW EXCLUSIVE MODE`;
      if ((await tx`SELECT id FROM invoices WHERE customer_id = ${id} LIMIT 1`).length) {
        throw new DataError(409, 'Cannot delete a customer with linked invoices.');
      }
      return Boolean((await tx`DELETE FROM customers WHERE id = ${id} RETURNING id`).length);
    });
  },
};
