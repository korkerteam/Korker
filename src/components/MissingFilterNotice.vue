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
  background: var(--surface-strong);
  padding: 28px;
  border-radius: 16px;
  width: min(420px, 90vw);
  box-shadow: var(--shadow-soft);
  font-family: Inter, system-ui, sans-serif;
}
.notice-card h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}
.notice-card p {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--muted);
}
.notice-card button {
  margin-top: 16px;
  border: none;
  border-radius: 999px;
  background: var(--accent-strong);
  color: white;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}
.notice-card button:hover {
  background: var(--accent);
}
.notice-card button:active {
  background: var(--primary-color);
}
</style>
