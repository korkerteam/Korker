<script setup>
import { ref } from 'vue'
import MenuPage from './views/MenuPage.vue'
import HeaderKorker from './components/HeaderKorker.vue'
import FilterPage from './components/FilterPage.vue'
import MyTeachers from './components/MyTeachers.vue'
import SearchBar from './views/SearchBar.vue'
import CzatCzatSahur from './components/CzatCzatSahur.vue'
import ProfilePage from './views/ProfilePage.vue'
import Ranks from './components/Ranks.vue'
import MapPage from './views/Map.vue'

const showProfile = ref(false)
const showRanks = ref(false)
const showFilter = ref(false)
const showTeachers = ref(false)

function toggleProfile() {
  showProfile.value = !showProfile.value
  if (showProfile.value) {
    showRanks.value = false
    showFilter.value = false
    showTeachers.value = false
  }
}

function toggleRank() {
  showRanks.value = !showRanks.value
  if (showRanks.value) {
    showProfile.value = false
    showFilter.value = false
    showTeachers.value = false
  }
}

function toggleFilter() {
  showFilter.value = !showFilter.value
  if (showFilter.value) {
    showProfile.value = false
    showRanks.value = false
    showTeachers.value = false
  }
}

function toggleTeachers() {
  showTeachers.value = !showTeachers.value
  if (showTeachers.value) {
    showProfile.value = false
    showRanks.value = false
    showFilter.value = false
  }
}
</script>

<template>
  <div class="main-layout">
    <div class="top-row">
      <div class="align-left">
        <div class="Korker">
          <HeaderKorker />
        </div>
        <div class="search-block">
          <SearchBar />
        </div>
      </div>
    </div>

    <div class="profile-block" v-show="showProfile">
      <ProfilePage />
    </div>
    <div class="ranks-block" v-show="showRanks">
      <Ranks />
    </div>
    <div class="filter-block" v-show="showFilter">
      <FilterPage />
    </div>
    <div class="teachers-block" v-show="showTeachers">
      <MyTeachers />
    </div>
    <div class="Czaty">
      <CzatCzatSahur />
    </div>

    <div class="content-row">
      <div class="Przyciski">
        <MenuPage
          @toggleProfile="toggleProfile"
          @toggleRank="toggleRank"
          @toggleFilter="toggleFilter"
          @toggleTeachers="toggleTeachers"
        />
      </div>
    </div>
    <div class="Mapa">
      <MapPage />
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100vh;
  position: relative;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.align-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
}

.search-block {
  display: flex;
  align-items: center;
  margin-left: auto;
  position: fixed;
  right: 0;
}

.Korker {
  margin-bottom: 10px;
}

.profile-block,
.filter-block,
.ranks-block,
.teachers-block {
  position: absolute;
  top: 47%;
  right: 340px;
  transform: translateY(-50%);
  display: flex;
  justify-content: flex-end;
}

.ranks-block {
  right: 350px;
}

.content-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.Przyciski {
  flex-shrink: 0;
}
.Czaty {
  position: fixed;
  right: 0;
  bottom: 40%;
}

.ranks-block {
  position: absolute;
  top: 47%;
  right: 350px;
  transform: translateY(-50%);
}

.Mapa {
  position: fixed;
  right: 12px;
  bottom: 10%;
}
</style>
