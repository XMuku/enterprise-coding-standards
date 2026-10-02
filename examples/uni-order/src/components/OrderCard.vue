<script setup lang="ts">
import type { Order } from '../types/order.ts';

defineProps<{ order: Order }>();
</script>

<template>
  <view class="order-card">
    <text class="order-id">{{ order.orderId }}</text>
    <text class="product-name">{{ order.productName }}</text>
    <text class="quantity">{{ order.quantity }} units</text>
  </view>
</template>

<style scoped>
.order-card { padding: 36rpx 0; border-bottom: 1px solid #c5c9bb; }
.order-id { display: block; font-size: 22rpx; color: #667361; }
.product-name { display: block; margin: 14rpx 0; font-size: 42rpx; }
.quantity { font-size: 28rpx; }
</style>
