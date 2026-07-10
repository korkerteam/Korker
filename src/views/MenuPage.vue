<script setup>
const emit = defineEmits(['toggleProfile'])

function handleProfileClick() {
  emit('toggleProfile')
}
</script>
<template>
  <div class="MenuButtons">
    <button>Szukaj Korepetycji</button>
    <button>Filtry</button>
    <button @click="handleProfileClick">Profil</button>
    <button>Ranking</button>
    <button>Moi Nauczyciele</button>
  </div>
</template>
<style scoped>
.MenuButtons {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
button {
  width: 700px;
  height: 100px;
}
</style>
