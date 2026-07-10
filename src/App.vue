<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MenuPage from './views/MenuPage.vue'
import HeaderKorker from './components/HeaderKorker.vue'
import FilterPage from './components/FilterPage.vue'
import MyTeachers from './components/MyTeachers.vue'
import SearchBar from './views/SearchBar.vue'
import CzatCzatSahur from './components/CzatCzatSahur.vue'
import ProfilePage from './views/ProfilePage.vue'
import Ranks from './components/Ranks.vue'
import MapPage from './views/Map.vue'
import FindKorks from './views/FindKorks.vue'

const route = useRoute()
const router = useRouter()

const showProfile = ref(false)
const showRanks = ref(false)
const showFilter = ref(false)
const showTeachers = ref(false)
const showMissingFilterNotice = ref(false)
const selectedFilters = ref({ subjects: [], levels: [], tags: [] })
const likedTeachers = ref([])
const currentTeacher = ref(null)
const showTeacherOverlay = ref(false)

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

function updateFilters(filters) {
  selectedFilters.value = filters
}

function goToSearchPage() {
  const hasSelection =
    selectedFilters.value.subjects.length > 0 ||
    selectedFilters.value.levels.length > 0 ||
    selectedFilters.value.tags.length > 0

  if (!hasSelection) {
    showMissingFilterNotice.value = true
    return
  }

  router.push({ name: 'korker-szukaj' })
}

function closeSearchPage() {
  router.push({ name: 'home' })
}

function closeMissingFilterNotice() {
  showMissingFilterNotice.value = false
}

function handleTeacherLike(teacher) {
  if (!teacher) return

  const exists = likedTeachers.value.some((item) => item.name === teacher.name)
  if (!exists) {
    likedTeachers.value = [...likedTeachers.value, teacher]
  }
}

function showTeacherProfile(teacher) {
  currentTeacher.value = teacher || null
  showTeacherOverlay.value = !!teacher
}

function removeLikedTeacher(teacher) {
  if (!teacher) return
  likedTeachers.value = likedTeachers.value.filter((t) => t.name !== teacher.name)
  // if currently viewing that teacher, close overlay
  if (currentTeacher.value && currentTeacher.value.name === teacher.name) {
    showTeacherOverlay.value = false
    currentTeacher.value = null
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

    <div class="profile-block" v-show="showProfile && route.name !== 'korker-szukaj'">
      <ProfilePage />
    </div>
    <div class="ranks-block" v-show="showRanks && route.name !== 'korker-szukaj'">
      <Ranks />
    </div>
    <div class="filter-block" v-show="showFilter && route.name !== 'korker-szukaj'">
      <FilterPage :model-value="selectedFilters" @update:model-value="updateFilters" @confirm="goToSearchPage" />
    </div>
    <div class="teachers-block" v-show="showTeachers && route.name !== 'korker-szukaj'">
      <MyTeachers :teachers="likedTeachers" @show-teacher="showTeacherProfile" @remove-teacher="removeLikedTeacher" />
    </div>
    <div class="Czaty" v-if="route.name !== 'korker-szukaj'">
      <CzatCzatSahur />
    </div>

    <div v-if="showMissingFilterNotice" class="notice-overlay" @click="closeMissingFilterNotice">
      <div class="notice-card" @click.stop>
        <h3>Wybierz filtry</h3>
        <p>Najpierw wybierz przynajmniej jeden filtr, a potem kliknij „Szukaj Korepetycji”.</p>
        <button @click="closeMissingFilterNotice">Rozumiem</button>
      </div>
    </div>

    <div v-if="showTeacherOverlay" class="teacher-overlay" @click="showTeacherOverlay = false">
      <div class="teacher-card-modal" @click.stop>
        <button class="close-x" @click="showTeacherOverlay = false">×</button>
        <div class="teacher-modal-header">
          <div class="avatar-large">{{ currentTeacher?.name?.charAt(0) }}</div>
          <div>
            <h3>{{ currentTeacher?.name }}</h3>
            <p class="muted">{{ currentTeacher?.subject }} • {{ currentTeacher?.level }}</p>
          </div>
        </div>
        <div class="teacher-modal-body">
          <p>Krótki opis nauczyciela może tu się znaleźć. (Placeholder)</p>
        </div>
      </div>
    </div>

    <div v-if="route.name === 'korker-szukaj'" class="search-overlay">
      <FindKorks :filters="selectedFilters" @close="closeSearchPage" @like-teacher="handleTeacherLike" />
    </div>

    <div class="content-row" v-if="route.name !== 'korker-szukaj'">
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
  right: 24px;
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

.teachers-block {
  right: 460px;
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
  z-index: 200;
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

.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: transparent;
}

.notice-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(15, 23, 42, 0.35);
}

.notice-card {
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  width: min(420px, 90vw);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.2);
}

.notice-card h3 {
  margin-top: 0;
}

.notice-card button {
  margin-top: 12px;
  border: none;
  border-radius: 10px;
  background: #4f75c7;
  color: white;
  padding: 10px 14px;
  cursor: pointer;
}

.teacher-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(10, 20, 40, 0.4);
}
.teacher-card-modal {
  background: #fff;
  padding: 20px;
  border-radius: 14px;
  width: min(560px, 92vw);
  box-shadow: 0 20px 50px rgba(16, 32, 64, 0.25);
  position: relative;
}
.teacher-modal-header { display:flex; gap:12px; align-items:center; }
.avatar-large { width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg,#6b8ef0,#4f75c7); color:#fff; display:inline-flex; align-items:center; justify-content:center; font-weight:700; font-size:20px }
.teacher-modal-body { margin-top:12px; color:#233; }
.close-x { position:absolute; right:12px; top:8px; background:transparent; border:none; font-size:22px; cursor:pointer }
</style>
