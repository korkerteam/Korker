<script setup>
const emit = defineEmits(['toggleProfile', 'toggleRank'])

function handleProfileClick() {
  emit('toggleProfile')
}

function handleRankClick() {
  emit('toggleRank')
}
</script>
<template>
  <div class="MenuButtons">
    <button>Szukaj Korepetycji</button>
    <button>Filtry</button>
    <button @click="handleProfileClick">Profil</button>
    <button @click="handleRankClick">Ranking</button>
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
