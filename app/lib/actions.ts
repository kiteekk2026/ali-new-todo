
'use server';

import { z } from 'zod';
import { invoiceInput } from './invoice-schema';
import { getDatabase } from './database';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/server';

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(
  prevState: State,
  formData: FormData,
) {
  const validatedFields = invoiceInput.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await getDatabase()`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.error('Database Error:', error);

    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  formData: FormData,
) {
  const { customerId, amount, status } = invoiceInput.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  await getDatabase()`
    UPDATE invoices
    SET customer_id = ${customerId},
        amount = ${amountInCents},
        status = ${status}
    WHERE id = ${id}
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await getDatabase()`
    DELETE FROM invoices
    WHERE id = ${id}
  `;

  revalidatePath('/dashboard/invoices');
}

/* =========================
   CUSTOMER ACTIONS
========================= */

const CreateCustomer = z.object({
  name: z.string().min(1, {
    message: 'Please enter a customer name.',
  }),

  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
  };
  message?: string | null;
};

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData,
) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Customer.',
    };
  }

  const { name, email } = validatedFields.data;

  try {
    await getDatabase()`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, '/customers/lee-robinson.png')
    `;
  } catch (error) {
    console.error('Database Error:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '23505'
    ) {
      return {
        message: 'A customer with this email already exists.',
      };
    }

    return {
      message: 'Database Error: Failed to Create Customer.',
    };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

/* =========================
   UPDATE CUSTOMER
========================= */

export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData,
) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Customer.',
    };
  }

  const { name, email } = validatedFields.data;

  try {
    await getDatabase()`
      UPDATE customers
      SET name = ${name},
          email = ${email}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '23505'
    ) {
      return {
        message: 'A customer with this email already exists.',
      };
    }

    return {
      message: 'Database Error: Failed to Update Customer.',
    };
  }

  revalidatePath('/dashboard/customers');
  revalidatePath(`/dashboard/customers/${id}`);

  redirect(`/dashboard/customers/${id}`);
}

/* =========================
   DELETE CUSTOMER
========================= */

export async function deleteCustomer(id: string) {
  try {
    const invoices = await getDatabase()`
      SELECT id
      FROM invoices
      WHERE customer_id = ${id}
      LIMIT 1
    `;

    if (invoices.length > 0) {
      return {
        message:
          'Cannot delete this customer because they have invoices.',
      };
    }

    await getDatabase()`
      DELETE FROM customers
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);

    return {
      message: 'Failed to delete customer.',
    };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

/* =========================
   AUTHENTICATION
========================= */

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const supabase = await createClient();

  const email = formData.get('email');
  const password = formData.get('password');

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email ||
    !password
  ) {
    return 'Please enter your email and password.';
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return 'Invalid email or password.';
  }

  revalidatePath('/', 'layout');

  const redirectTo = formData.get('redirectTo');

  const destination =
    typeof redirectTo === 'string' &&
    redirectTo.startsWith('/') &&
    !redirectTo.startsWith('//')
      ? redirectTo
      : '/dashboard';

  redirect(destination);
}
