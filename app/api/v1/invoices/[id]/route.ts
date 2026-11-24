import { handler } from '@/app/lib/api-handlers';

export const GET = handler('invoices', 'GET', true);
export const PUT = handler('invoices', 'PUT', true);
export const DELETE = handler('invoices', 'DELETE', true);
