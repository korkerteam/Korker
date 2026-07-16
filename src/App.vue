<script setup>
import { ref, provide, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderKorker from './components/HeaderKorker.vue'
import SearchBar from './components/header/SearchBar.vue'
import CzatCzatSahur from './components/CzatCzatSahur.vue'
import MapPage from './components/Map.vue'
import MissingFilterNotice from './components/MissingFilterNotice.vue'
import TeacherOverlay from './components/TeacherOverlay.vue'
import MainContent from './views/footer/MenuPage.vue'
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
const isDarkMode = ref(false)
const isHighContrast = ref(false)
const showSettingsMenu = ref(false)
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

  const teacherId = teacher?.id != null ? String(teacher.id) : null
  const exists = likedTeachers.value.some((item) => {
    const itemId = item?.id != null ? String(item.id) : null
    return itemId && teacherId ? itemId === teacherId : item?.name === teacher?.name
  })

  if (!exists) {
    likedTeachers.value = [
      ...likedTeachers.value,
      teacherId ? { ...teacher, id: teacherId } : { ...teacher },
    ]
  }
}

function showTeacherProfile(teacher) {
  currentTeacher.value = teacher || null
}

function removeLikedTeacher(teacher) {
  if (!teacher) return

  const teacherId = teacher.id !== undefined ? String(teacher.id) : undefined
  likedTeachers.value = likedTeachers.value.filter((t) => {
    const itemId = t.id !== undefined ? String(t.id) : undefined
    return itemId !== undefined && teacherId !== undefined
      ? itemId !== teacherId
      : t.name !== teacher.name
  })

  if (
    currentTeacher.value &&
    (currentTeacher.value.id !== undefined && teacherId !== undefined
      ? String(currentTeacher.value.id) === teacherId
      : currentTeacher.value.name === teacher.name)
  ) {
    currentTeacher.value = null
  }
}

function applyTheme(nextValue) {
  const theme = nextValue ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme
  isDarkMode.value = nextValue
  localStorage.setItem('korker-theme', theme)
}

function applyAccessibility(nextValue) {
  const contrast = nextValue ? 'high' : 'default'
  document.documentElement.setAttribute('data-contrast', contrast)
  document.documentElement.style.setProperty('--contrast-mode', contrast)
  isHighContrast.value = nextValue
  localStorage.setItem('korker-high-contrast', String(nextValue))
}

function toggleTheme() {
  applyTheme(!isDarkMode.value)
}

function toggleHighContrast() {
  applyAccessibility(!isHighContrast.value)
}

function toggleSettingsMenu() {
  showSettingsMenu.value = !showSettingsMenu.value
}

function closeSettingsMenu() {
  showSettingsMenu.value = false
}

onMounted(() => {
  const savedTheme = localStorage.getItem('korker-theme')
  const savedContrast = localStorage.getItem('korker-high-contrast')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(savedTheme ? savedTheme === 'dark' : prefersDark)
  applyAccessibility(savedContrast === 'true')
})
</script>

<template>
  <div class="main-layout">
    <div class="top-row">
      <div class="Korker" @click="homeTrigger++">
        <HeaderKorker />
      </div>

      <div class="search-block">
        <SearchBar @select-teacher="showTeacherProfile" />
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
      </template>

      <template v-else>
        <router-view />
      </template>
    </div>

    <CzatCzatSahur />

    <div class="Mapa">
      <MapPage />
    </div>

    <button
      class="settings-fab"
      type="button"
      :title="'Ustawienia motywu'"
      :aria-label="'Ustawienia motywu'"
      @click="toggleSettingsMenu"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm7.2 3.8a7.3 7.3 0 0 0-.1-1.2l1.7-1.3-1.7-3-2 .8a7.3 7.3 0 0 0-2.1-1.2L14.1 3h-4.2l-.6 2.2a7.3 7.3 0 0 0-2.1 1.2l-2-.8-1.7 3 1.7 1.3a7.3 7.3 0 0 0 0 2.4l-1.7 1.3 1.7 3 2-.8c.7.5 1.4.9 2.1 1.2l.6 2.2h4.2l.6-2.2c.7-.3 1.4-.7 2.1-1.2l2 .8 1.7-3-1.7-1.3c.1-.4.1-.8.1-1.2Z"
          fill="currentColor"
        />
      </svg>
    </button>

    <div v-if="showSettingsMenu" class="settings-menu-backdrop" @click="closeSettingsMenu">
      <div class="settings-menu" @click.stop>
        <div class="settings-menu-title">Ustawienia</div>

        <label class="setting-row" :class="{ active: isDarkMode }">
          <span class="setting-label">Tryb ciemny</span>
          <input type="checkbox" :checked="isDarkMode" @change="toggleTheme" />
          <span class="setting-slider"></span>
        </label>

        <label class="setting-row" :class="{ active: isHighContrast }">
          <span class="setting-label">Wysoki kontrast</span>
          <input type="checkbox" :checked="isHighContrast" @change="toggleHighContrast" />
          <span class="setting-slider"></span>
        </label>
      </div>
    </div>

    <FooterKorker />
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
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

.settings-fab {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 1200;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(79, 117, 199, 0.35);
  transition:
    transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.25s ease;
}

.settings-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 28px rgba(79, 117, 199, 0.5);
}

.settings-fab:active {
  transform: scale(0.92);
}

.settings-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1190;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 0 0 96px 24px;
  background: rgba(2, 6, 23, 0.3);
  backdrop-filter: blur(6px);
}

.settings-menu {
  background: linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-soft) 100%);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 14px 16px;
  min-width: 220px;
  box-shadow: var(--shadow);
}

.settings-menu-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--text);
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.92rem;
  margin-top: 8px;
  color: var(--text);
}

.setting-row input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.setting-slider {
  position: relative;
  width: 46px;
  height: 26px;
  border-radius: 999px;
  background: var(--border);
  transition: background 0.2s ease;
}

.setting-slider::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease;
}

.setting-row.active .setting-slider {
  background: var(--primary-color);
}

.setting-row.active .setting-slider::before {
  transform: translateX(20px);
}

.setting-label {
  color: var(--muted);
  flex: 1;
}
</style>
