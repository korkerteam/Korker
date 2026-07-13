<script setup>
defineProps({ teacher: { type: Object, default: null } })
const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="teacher" class="teacher-overlay" @click="emit('close')">
    <div class="teacher-card-modal" @click.stop>
      <button class="close-x" @click="emit('close')">×</button>
      <div class="teacher-modal-header">
        <div class="avatar-large">{{ teacher?.name?.charAt(0) }}</div>
        <div>
          <h3>{{ teacher?.name }}</h3>
          <p class="muted">{{ teacher?.subject }} • {{ teacher?.level }}</p>
        </div>
      </div>
      <div class="teacher-modal-body">
        <p>Krótki opis nauczyciela może tu się znaleźć. (Placeholder)</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.teacher-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(10, 20, 40, 0.4);
}
.teacher-card-modal {
  background: #fff;
  padding: 20px;
  border-radius: 14px;
  width: min(560px, 92vw);
  box-shadow: 0 20px 50px rgba(16, 32, 64, 0.25);
  position: relative;
}
.teacher-modal-header {
  display: flex;
  gap: 12px;
  align-items: center;
}
.avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b8ef0, var(--primary-color));
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
}
.teacher-modal-body {
  margin-top: 12px;
  color: #233;
}
.close-x {
  position: absolute;
  right: 12px;
  top: 8px;
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
}
</style>
