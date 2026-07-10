<script setup>
const emit = defineEmits([
  'toggleProfile',
  'toggleRank',
  'toggleFilter',
  'toggleTeachers',
  'goToSearchPage',
  'openAuth',
])

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
    <button @click="handleSearchClick"><span>Szukaj korepetycji</span></button>
    <button @click="handleFilterClick"><span>Filtry</span></button>
    <button @click="handleRankClick"><span>Ranking</span></button>
    <button @click="handleTeachersClick"><span>Moi Nauczyciele</span></button>
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
  background-color: var(--primary-color);
  font-family: Horizon;
  font-size: 30px;
  border: 0;
  border-radius: 0 100px 100px 0;
  text-align: left;
  cursor: pointer;
  color: white;
  text-transform: uppercase;
}

button > span {
  margin-left: 10px;
}

button:hover {
  opacity: 0.95;
}
</style>
