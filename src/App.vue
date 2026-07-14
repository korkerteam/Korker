<script setup>
import { ref, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderKorker from './components/HeaderKorker.vue'
import SearchBar from './components/header/SearchBar.vue'
import CzatCzatSahur from './components/CzatCzatSahur.vue'
import MapPage from './components/Map.vue'
import MissingFilterNotice from './components/MissingFilterNotice.vue'
import TeacherOverlay from './components/TeacherOverlay.vue'
import MainContent from './views/MenuPage.vue'
import LoginButton from './components/header/LoginButton.vue'
import AuthModal from './components/auth/AuthModal.vue'
import FooterKorker from './components/FooterKorker.vue'
import { useAuth } from '@/composables/useAuth.js'

const route = useRoute()
const router = useRouter()
const { showAuthModal, openAuthModal, closeAuthModal } = useAuth()

const selectedFilters = ref({ subjects: [], levels: [], tags: [] })
const likedTeachers = ref([])
const currentTeacher = ref(null)
const showMissingFilterNotice = ref(false)
const homeTrigger = ref(0)
provide('homeTrigger', homeTrigger)

// --- GLOBALNY STAN CZATU (DO PRZEKAZYWANIA MIĘDZY KOMPONENTAMI) ---
const showChatGlobal = ref(false)
const chatTargetUserId = ref(null)

provide('globalChat', {
  showChatGlobal,
  chatTargetUserId,
  openChatWithUser(userId) {
    chatTargetUserId.value = userId
    showChatGlobal.value = true
  },
})

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
      <div class="Korker" @click="homeTrigger++">
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

    <div class="main-content-area">
      <template v-if="['home', 'profil', 'nauczyciele'].includes(route.name)">
        <MainContent
          :selected-filters="selectedFilters"
          :liked-teachers="likedTeachers"
          @update:selected-filters="selectedFilters = $event"
          @show-teacher="showTeacherProfile"
          @like-teacher="handleTeacherLike"
          @remove-liked-teacher="removeLikedTeacher"
          @open-auth="openAuthModal"
        />

        <CzatCzatSahur />
      </template>

      <template v-else>
        <router-view />
      </template>
    </div>

    <div class="Mapa">
      <MapPage />
    </div>

    <FooterKorker />
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-height: 100vh;
  position: relative;
  padding: 22px 26px 18px;
}

.main-content-area {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding-bottom: 20px;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding-bottom: 10px;
  position: relative;
  z-index: 10;
}

.search-block {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 10px;
  flex-wrap: wrap;
}

.Korker {
  display: inline-flex;
}

.Mapa {
  position: fixed;
  right: 16px;
  bottom: 10%;
  z-index: 5;
}
</style>
