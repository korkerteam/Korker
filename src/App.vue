<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderKorker from './components/HeaderKorker.vue'
import SearchBar from './components/header/SearchBar.vue'
import CzatCzatSahur from './components/CzatCzatSahur.vue'
import MapPage from './components/Map.vue'
import FindKorks from './views/menu/FindKorks.vue'
import MissingFilterNotice from './components/MissingFilterNotice.vue'
import TeacherOverlay from './components/TeacherOverlay.vue'
import MainContent from './views/MenuPage.vue'
import LoginButton from './components/header/LoginButton.vue'
import AuthModal from './components/auth/AuthModal.vue'
import { useAuth } from '@/composables/useAuth.js'

const route = useRoute()
const router = useRouter()
const { showAuthModal, openAuthModal, closeAuthModal } = useAuth()

const selectedFilters = ref({ subjects: [], levels: [], tags: [] })
const likedTeachers = ref([])
const currentTeacher = ref(null)
const showMissingFilterNotice = ref(false)
function goToSearchPage() {
  const { subjects, levels, tags } = selectedFilters.value
  const hasSelection = subjects.length > 0 || levels.length > 0 || tags.length > 0

  if (!hasSelection) {
    showMissingFilterNotice.value = true
    return
  }

  router.push({ name: 'korker-szukaj' })
}

function closeSearchPage() {
  router.push({ name: 'home' })
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
}

function removeLikedTeacher(teacher) {
  if (!teacher) return

  likedTeachers.value = likedTeachers.value.filter((t) => t.name !== teacher.name)

  if (currentTeacher.value && currentTeacher.value.name === teacher.name) {
    currentTeacher.value = null
  }
}
</script>

<template>
  <div class="main-layout">
    <div class="top-row">
      <div class="Korker">
        <HeaderKorker />
      </div>
      <div class="search-block">
        <SearchBar />
        <LoginButton @login="openAuthModal" />
      </div>
    </div>

    <AuthModal v-if="showAuthModal" @close="closeAuthModal" />

    <MissingFilterNotice :show="showMissingFilterNotice" @close="showMissingFilterNotice = false" />

    <TeacherOverlay :teacher="currentTeacher" @close="currentTeacher = null" />

    <div v-if="route.name === 'korker-szukaj'" class="search-overlay">
      <FindKorks
        :filters="selectedFilters"
        @close="closeSearchPage"
        @like-teacher="handleTeacherLike"
      />
    </div>

    <div class="main-content-area" v-if="route.name !== 'korker-szukaj'">
      <MainContent
        :selected-filters="selectedFilters"
        :liked-teachers="likedTeachers"
        @update:selected-filters="selectedFilters = $event"
        @go-to-search="goToSearchPage"
        @show-teacher="showTeacherProfile"
        @like-teacher="handleTeacherLike"
        @remove-liked-teacher="removeLikedTeacher"
        @open-auth="openAuthModal"
      />

      <CzatCzatSahur />
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
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  position: relative;
}

.main-content-area {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 10px;
  position: relative;
  z-index: 70;
}

.search-block {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 5px;
}

.Korker {
  margin-bottom: 10px;
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
</style>
