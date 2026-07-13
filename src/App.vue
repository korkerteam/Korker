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
const showWelcome = ref(true)
const welcomeDragStartY = ref(null)
const welcomeDragDistance = ref(0)
const welcomeDismissing = ref(false)

function startWelcomeDrag(event) {
  welcomeDragStartY.value = event.clientY
  welcomeDragDistance.value = 0
  welcomeDismissing.value = false
  event.currentTarget.setPointerCapture(event.pointerId)
}

function moveWelcomeDrag(event) {
  if (welcomeDragStartY.value === null) return
  event.preventDefault()
  const delta = event.clientY - welcomeDragStartY.value
  welcomeDragDistance.value = Math.min(0, delta)
}

function endWelcomeDrag(event) {
  if (welcomeDragStartY.value === null) return
  if (event?.currentTarget?.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  if (welcomeDragDistance.value < -80) {
    welcomeDismissing.value = true
    setTimeout(() => {
      showWelcome.value = false
      welcomeDismissing.value = false
      welcomeDragDistance.value = 0
    }, 680)
  } else {
    welcomeDragDistance.value = 0
  }

  welcomeDragStartY.value = null
}

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

    <div
      v-if="route.name !== 'korker-szukaj' && showWelcome"
      class="welcome-screen"
      :class="{ dismissing: welcomeDismissing }"
      :style="{ '--drag-distance': `${welcomeDragDistance.value}px` }"
      @selectstart.prevent
      @pointerdown.prevent="startWelcomeDrag"
      @pointermove.prevent="moveWelcomeDrag"
      @pointerup.prevent="endWelcomeDrag"
      @pointercancel.prevent="endWelcomeDrag"
      @pointerleave.prevent="endWelcomeDrag"
    >
      <div class="welcome-card">
        <div class="welcome-copy">
          <p class="welcome-label">Witamy w</p>
          <h1>Korker</h1>
          <p class="welcome-text">Przeciągnij w górę, aby rozpocząć wyszukiwanie korepetytora.</p>
        </div>

        <div class="swipe-indicator">
          <span class="swipe-line"></span>
          <p>Przesuń w górę</p>
          <span class="swipe-arrow">↑</span>
        </div>
      </div>
    </div>

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

.welcome-screen {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  justify-content: center;
  align-items: center;
  background:
    radial-gradient(circle at top, rgba(79, 117, 199, 0.18), transparent 28%),
    radial-gradient(circle at bottom, rgba(34, 197, 94, 0.16), transparent 35%),
    linear-gradient(180deg, #eef2ff, #ffffff);
  backdrop-filter: blur(8px);
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  transform: translateY(calc(var(--drag-distance, 0px) * 0.6));
  transition:
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.55s ease;
  pointer-events: auto;
}

.welcome-card {
  pointer-events: auto;
}

.welcome-screen.dismissing {
  transform: translateY(-100vh);
  opacity: 0;
  transition:
    transform 0.65s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.55s ease;
}

.welcome-card {
  transition: opacity 0.16s ease;
  user-select: none;
  -webkit-user-select: none;
  width: min(560px, 92vw);
  padding: 42px 34px 32px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.18);
  display: grid;
  gap: 26px;
  text-align: center;
}

.welcome-copy {
  display: grid;
  gap: 16px;
}

.welcome-label {
  margin: 0;
  color: #4f75c7;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.welcome-card h1 {
  margin: 0;
  font-size: clamp(42px, 5vw, 64px);
  line-height: 0.94;
  color: #0f172a;
}

.welcome-text {
  margin: 0;
  color: #475569;
  line-height: 1.8;
  font-size: 16px;
}

.swipe-indicator {
  display: grid;
  gap: 12px;
  justify-items: center;
}

.swipe-line {
  width: 60px;
  height: 6px;
  border-radius: 999px;
  background: rgba(79, 117, 199, 0.24);
  animation: pulse 1.6s infinite ease-in-out;
}

.swipe-indicator p {
  margin: 0;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
}

.swipe-arrow {
  font-size: 32px;
  color: #2563eb;
  animation: floatUp 1.2s infinite ease-in-out;
}

@keyframes floatUp {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.7;
    transform: scaleX(1);
  }
  50% {
    opacity: 1;
    transform: scaleX(1.08);
  }
}
</style>
