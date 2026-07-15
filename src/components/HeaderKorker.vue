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
  color: var(--accent);
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(79, 117, 199, 0.2);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(79, 117, 199, 0.12);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    opacity 180ms ease;
}

.logo-image {
  width: 66px;
  height: 66px;
  object-fit: contain;
}

.logo-text {
  display: inline-block;
  letter-spacing: -0.04em;
}

.header-button:hover {
  transform: translateY(-1px);
}

.header-button:active {
  opacity: 0.95;
  transform: translateY(0);
}
</style>
