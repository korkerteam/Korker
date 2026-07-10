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
}

</style>
