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
  gap: 16px;
  min-width: 520px;
  height: 96px;
  padding: 0 24px;
  font-family: Horizon;
  font-size: 54px;
  font-weight: 900;
  color: #4f75c7;
  background-color: #ffffff;
  border: none;
  border-radius: 32px;
  box-shadow: 0 16px 24px rgba(24, 78, 68, 0.25);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
  cursor: pointer;
}

.logo-image {
  width: 82px;
  height: 82px;
  object-fit: contain;
}

.logo-text {
  display: inline-block;
  letter-spacing: -0.05em;
}

.header-button:active {
  opacity: 0.94;
}
</style>
