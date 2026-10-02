<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import OrderCard from '../../components/OrderCard.vue';
import { listOrders } from '../../api/order.ts';
import { isValidQuantity } from '../../domain/quantity.ts';
import type { Order } from '../../types/order.ts';

const orders = ref<readonly Order[]>([]);
const status = ref<'loading' | 'ready' | 'error'>('loading');

async function loadOrders(): Promise<void> {
  status.value = 'loading';
  try {
    const result = await listOrders();
    if (!result.every(order => isValidQuantity(order.quantity))) throw new Error('Invalid quantity');
    orders.value = result;
    status.value = 'ready';
  } catch {
    status.value = 'error';
  }
}

onLoad(() => { void loadOrders(); });
</script>

<template>
  <view class="notebook">
    <text class="eyebrow">LOCAL DEMO / 01</text>
    <text class="heading">Order Notebook</text>
    <text class="note">Mock data. No account or backend connection.</text>
    <text v-if="status === 'loading'">Loading orders...</text>
    <view v-else-if="status === 'error'">
      <text>Orders could not be loaded.</text>
      <button @click="loadOrders">Try again</button>
    </view>
    <view v-else>
      <text v-if="orders.length === 0">No orders yet.</text>
      <OrderCard v-for="order in orders" :key="order.orderId" :order="order" />
    </view>
  </view>
</template>

<style scoped>
.notebook { max-width: 760px; padding: 56rpx 40rpx; margin: 0 auto; }
.eyebrow { font-size: 24rpx; letter-spacing: 4rpx; color: #536b5b; }
.heading { display: block; font-size: 68rpx; margin: 28rpx 0; }
.note { display: block; margin-bottom: 50rpx; font-size: 26rpx; color: #667361; }
</style>
