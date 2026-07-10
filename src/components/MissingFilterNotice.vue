<script setup>
defineProps({ show: Boolean })
const emit = defineEmits(['close'])
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="notice-overlay" @click="emit('close')">
      <div class="notice-card" @click.stop>
        <h3>Wybierz filtry</h3>
        <p>Najpierw wybierz przynajmniej jeden filtr, a potem kliknij „Szukaj Korepetycji”.</p>
        <button @click="emit('close')">Rozumiem</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.notice-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(15, 23, 42, 0.35);
}
.notice-card {
  background: #ffffff;
  padding: 28px;
  border-radius: 16px;
  width: min(420px, 90vw);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.2);
  font-family: Inter, system-ui, sans-serif;
}
.notice-card h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}
.notice-card p {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: #4b5563;
}
.notice-card button {
  margin-top: 16px;
  border: none;
  border-radius: 999px;
  background: #4f75c7;
  color: white;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}
.notice-card button:hover {
  background: #4368b5;
}
.notice-card button:active {
  background: #3a5ca0;
}
</style>
