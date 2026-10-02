import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidQuantity } from '../src/domain/quantity.ts';
import { listOrders } from '../src/api/order.ts';

test('quantity accepts inclusive integer boundaries', () => {
  for (const value of [1, 2, 99]) assert.equal(isValidQuantity(value), true);
});

test('quantity rejects non-finite, fractional and out-of-range values', () => {
  for (const value of [0, -1, 100, 1.5, NaN, Infinity]) assert.equal(isValidQuantity(value), false);
});

test('mock adapter returns independently allocated valid camelCase orders', async () => {
  const first = await listOrders();
  const second = await listOrders();
  assert.notEqual(first, second);
  assert.ok(first.length > 0);
  assert.equal(new Set(first.map(order => order.orderId)).size, first.length);
  for (const order of first) {
    assert.deepEqual(Object.keys(order).sort(), ['orderId', 'productName', 'quantity']);
    assert.ok(isValidQuantity(order.quantity));
    assert.ok(order.productName.trim().length > 0);
  }
});
