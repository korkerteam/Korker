<script setup>
defineEmits(['toggle'])
</script>

<template>
  <button class="fab" @click="$emit('toggle')" title="Czat">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
        fill="currentColor"
      />
      <rect x="7" y="9" width="10" height="2" rx="1" fill="white" />
      <rect x="7" y="13" width="7" height="2" rx="1" fill="white" />
    </svg>
  </button>
</template>

<style scoped>
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(79, 117, 199, 0.35);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.fab:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 28px rgba(79, 117, 199, 0.5);
}
.fab:active {
  transform: scale(0.93);
}
</style>
