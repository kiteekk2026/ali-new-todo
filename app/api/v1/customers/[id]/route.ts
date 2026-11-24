import { handler } from '@/app/lib/api-handlers';

export const GET = handler('customers', 'GET', true);
export const PUT = handler('customers', 'PUT', true);
export const DELETE = handler('customers', 'DELETE', true);
