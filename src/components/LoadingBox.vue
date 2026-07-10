<script setup>
defineProps({
  minHeight: { type: String, default: '360px' },
})
</script>

<template>
  <div class="loading-box" :style="{ minHeight }"></div>
</template>

<style scoped>
.loading-box {
  width: 100%;
  background: #e5e7eb;
  border-radius: 16px;
}
</style>
