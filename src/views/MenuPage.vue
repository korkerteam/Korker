<script setup>
const emit = defineEmits(['toggleProfile', 'toggleRank', 'toggleFilter', 'toggleTeachers', 'goToSearchPage'])

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

function handleSearchClick() {
  emit('goToSearchPage')
}
</script>
<template>
  <div class="MenuButtons">
    <button @click="handleSearchClick">Szukaj Korepetycji</button>
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
  width: 600px;
  height: 100px;
  border-radius: 100px;
  background-color: #4f75c7;
  font-family: Horizon;
  font-size: 30px;
  border: 0;
  border-radius: 0 100px 100px 0;
  text-align: left;
}
</style>
