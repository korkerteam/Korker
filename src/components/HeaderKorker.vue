<script setup>
import { useRouter } from 'vue-router'
import logo from '@/assets/photos/logo.png'

const router = useRouter()

function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <button class="header-button" @click="goHome" type="button">
    <img class="logo-image" :src="logo" alt="Korker logo" />
    <span class="logo-text">Korker</span>
  </button>
</template>
<style scoped>
.header-button {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 18px 28px;
  font-family: Horizon, 'Inter', system-ui, sans-serif;
  font-size: 2.15rem;
  font-weight: 800;
  color: var(--logo-color, var(--brand-blue, #4f75c7));
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 0 24px 24px 0;
  box-shadow: var(--shadow-soft);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    opacity 180ms ease;
}

:root[data-theme='dark'] .header-button {
  background: var(--accent);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 10px 28px rgba(79, 117, 199, 0.28);
}

:root[data-theme='dark'][data-contrast='high'] .header-button {
  background: var(--accent);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 10px 28px rgba(79, 117, 199, 0.28);
}

:root[data-contrast='high']:not([data-theme='dark']) .header-button {
  background: var(--surface-strong);
  color: #ffcf33;
  border-color: #000000;
  box-shadow: 0 0 0 2px #000000;
}

:root[data-theme='dark'][data-contrast='high'] .logo-text,
:root[data-theme='dark'][data-contrast='high'] .header-button {
  color: #ffffff;
}

:root[data-contrast='high']:not([data-theme='dark']) .logo-text,
:root[data-contrast='high']:not([data-theme='dark']) .header-button {
  color: var(--accent);
}

:root[data-theme='dark'] .logo-text,
:root[data-theme='dark'] .header-button {
  color: #ffffff;
}

.logo-image {
  width: 66px;
  height: 66px;
  object-fit: contain;
  filter: none;
}

:root[data-theme='dark'] .logo-image {
  filter: brightness(0) invert(1);
}

:root[data-contrast='high']:not([data-theme='dark']) .logo-image {
  filter: brightness(1.15) saturate(2.2) hue-rotate(8deg);
}

:root[data-theme='dark'][data-contrast='high'] .logo-image {
  filter: brightness(0) invert(1);
}

.logo-text {
  display: inline-block;
  letter-spacing: -0.04em;
}

@media (max-width: 768px) {
  .header-button {
    width: auto;
    justify-content: flex-start;
    padding: 10px 12px;
    font-size: 1.25rem;
    gap: 8px;
    border-radius: 0 16px 16px 0;
  }

  .logo-image {
    width: 38px;
    height: 38px;
  }
}

.header-button:hover {
  transform: translateY(-1px);
}

.header-button:active {
  opacity: 0.95;
  transform: translateY(0);
}
</style>
