<script setup>
const emit = defineEmits(['toggleProfile', 'toggleRank', 'toggleFilter', 'toggleTeachers'])

function handleProfileClick() {
  emit('toggleProfile')
}

function handleRankClick() {
  emit('toggleRank')
}

function handleFilterClick() {
  emit('toggleFilter')
}

function handleTeachersClick() {
  emit('toggleTeachers')
}
</script>
<template>
  <div class="MenuButtons">
    <button>Szukaj Korepetycji</button>
    <button @click="handleFilterClick">Filtry</button>
    <button @click="handleProfileClick">Profil</button>
    <button @click="handleRankClick">Ranking</button>
    <button @click="handleTeachersClick">Moi Nauczyciele</button>
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
  border-radius: 10px;
  background-color: #4f75c7;
  font-family: Horizon;
  font-size: 30px
}
</style>
