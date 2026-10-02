import type { Order } from '../types/order.ts';

export async function listOrders(): Promise<readonly Order[]> {
  // Deliberately local: swap this adapter only after agreeing a real API contract.
  return [
    { orderId: 'sample-1', productName: 'Field notebook', quantity: 2 },
    { orderId: 'sample-2', productName: 'Graphite pencil', quantity: 4 },
  ];
}
