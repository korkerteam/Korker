<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <button @click="goHome" type="button">Korker</button>
</template>
<style scoped>
button {
  width: 800px;
  height: 100px;
  font-size: 70px;
  font-family: Horizon;
  border-radius: 10px;
  background-color: #4f75c7;
  border: 0;
  font-family: Horizon;
  font-size: 30px;
  border: 0;
  border-radius: 0 100px 100px 0;
  text-align: left;
}
</style>
