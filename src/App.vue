<script setup>
import { ref, provide, onMounted, onUnmounted, watch, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderKorker from './components/HeaderKorker.vue'
import SearchBar from './components/header/SearchBar.vue'
import CzatCzatSahur from './components/CzatCzatSahur.vue'
import MissingFilterNotice from './components/MissingFilterNotice.vue'
import TeacherOverlay from './components/TeacherOverlay.vue'
import MainContent from './views/footer/MenuPage.vue'
import LoginButton from './components/header/LoginButton.vue'
import AuthModal from './components/auth/AuthModal.vue'
import FooterKorker from './components/FooterKorker.vue'
import { useAuth } from '@/composables/useAuth.js'
import { useMessaging } from '@/composables/useMessaging.js'
import {
  fetchSavedTutorIds,
  addSavedTutor,
  removeSavedTutor,
  fetchTutorProfiles,
} from '@/services/likeService.js'
import { toggleProfile, toggleRank, toggleTeachers } from '@/composables/menuToggle.js'

const route = useRoute()
const router = useRouter()
const { showAuthModal, openAuthModal, closeAuthModal, profileData, isAuthenticated } = useAuth()
const { activeUserId } = useMessaging()
const { showChatGlobal } = inject('globalChat', {
  showChatGlobal: ref(false),
  chatTargetUserId: ref(null),
  openChatWithUser: () => {},
})

const selectedFilters = ref({ subjects: [], levels: [], tags: [] })
const likedTeachers = ref([])
const currentTeacher = ref(null)
const homeTrigger = ref(0)
const isDarkMode = ref(false)
const isHighContrast = ref(false)
const showSettingsMenu = ref(false)
const mobileMenuOpen = ref(false)
const isMobileViewport = ref(false)
const calendarResetKey = ref(0)
const isTutorAccount = computed(() =>
  `${[profileData.value?.account_type, profileData.value?.accountType].find(Boolean) || ''}`
    .toLowerCase()
    .includes('tutor'),
)
provide('homeTrigger', homeTrigger)

function updateMobileViewport() {
  isMobileViewport.value = window.innerWidth <= 768
}

const shouldHideSettingsFab = computed(() => {
  return isMobileViewport.value && showChatGlobal.value && !!activeUserId.value
})

async function loadSavedTutors() {
  try {
    const authIds = await fetchSavedTutorIds()
    if (!authIds.length) return
    const profiles = await fetchTutorProfiles(authIds)
    const byAuthId = {}
    for (const p of profiles) {
      byAuthId[p.auth_id] = { ...p, id: String(p.id) }
    }
    likedTeachers.value = authIds
      .map((id) => byAuthId[id])
      .filter((p) => {
        if (!p) return false
        const accountType = [p.account_type, p.accountType].find(Boolean)
        const isTutor = `${accountType || ''}`.toLowerCase().includes('tutor')
        return isTutorAccount.value ? !isTutor : isTutor
      })
  } catch (e) {
    console.error('Failed to load saved tutors:', e)
  }
}

watch(
  () => profileData.value,
  (profile) => {
    if (profile) {
      loadSavedTutors()
    }
  },
)

watch(isTutorAccount, () => {
  if (profileData.value) loadSavedTutors()
})

// --- GLOBALNY STAN CZATU (DO PRZEKAZYWANIA MIĘDZY KOMPONENTAMI) ---
const chatTargetUserId = ref(null)

provide('globalChat', {
  showChatGlobal,
  chatTargetUserId,
  openChatWithUser(userId) {
    chatTargetUserId.value = userId
    showChatGlobal.value = true
  },
})

function normalizeTeacher(teacher, teacherId) {
  const base = teacherId ? { ...teacher, id: teacherId } : { ...teacher }
  if (base.tutor_post && typeof base.tutor_post === 'object') {
    return base
  }
  return {
    ...base,
    profile_picture: base.profile_picture || base.image || null,
    tutor_post: {
      subject: base.subject || '',
      level: base.level || '',
      tags: base.tags || [],
      description: base.bio || '',
      price: base.price || 50,
      city: base.city || '',
      lessonPlace: base.lessonPlace || '',
      weeklyAvailability: base.weeklyAvailability || {},
    },
  }
}

function handleTeacherLike(teacher) {
  if (!teacher) return

  const teacherId = teacher?.id != null ? String(teacher.id) : null
  const exists = likedTeachers.value.some((item) => {
    const itemId = item?.id != null ? String(item.id) : null
    return itemId && teacherId ? itemId === teacherId : item?.name === teacher?.name
  })

  if (!exists) {
    likedTeachers.value = [...likedTeachers.value, normalizeTeacher(teacher, teacherId)]

    const authId = teacher.auth_id
    if (authId) {
      addSavedTutor(authId).catch(console.error)
      loadSavedTutors()
    }
  }
}

function showTeacherProfile(teacher) {
  currentTeacher.value = teacher || null
}

provide('showTeacherProfile', showTeacherProfile)

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

  const authId = teacher.auth_id
  if (authId) {
    removeSavedTutor(authId).catch(console.error)
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

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function requireAuth() {
  if (!isAuthenticated.value) {
    openAuthModal()
    return false
  }
  return true
}

function navigateToPanel(panel) {
  if (route.query.panel === panel) {
    router.push('/')
  } else {
    router.push({ path: '/', query: { panel } })
  }
}

function handleToggleProfile() {
  toggleProfile(route, router)
  closeMobileMenu()
}

function handleToggleRank() {
  toggleRank(route, router)
  closeMobileMenu()
}

function handleToggleTeachers() {
  if (!requireAuth()) return
  toggleTeachers(route, router)
  closeMobileMenu()
}

function handleToggleSearch() {
  navigateToPanel('search')
  closeMobileMenu()
}

function handleToggleCalendar() {
  if (!requireAuth()) return
  if (route.query.panel === 'calendar') {
    calendarResetKey.value++
  } else {
    navigateToPanel('calendar')
  }
  closeMobileMenu()
}

onMounted(() => {
  updateMobileViewport()
  window.addEventListener('resize', updateMobileViewport)

  const savedTheme = localStorage.getItem('korker-theme')
  const savedContrast = localStorage.getItem('korker-high-contrast')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(savedTheme ? savedTheme === 'dark' : prefersDark)
  applyAccessibility(savedContrast === 'true')
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMobileViewport)
})
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
        <button
          class="mobile-menu-trigger"
          type="button"
          :aria-label="'Otwórz menu'"
          :aria-expanded="mobileMenuOpen"
          @click="toggleMobileMenu"
        >
          <svg class="mobile-menu-trigger-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <path d="M4 12h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <path d="M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>

    <AuthModal v-if="showAuthModal" @close="closeAuthModal" />

    <TeacherOverlay :teacher="currentTeacher" @close="currentTeacher = null" />

    <div v-if="mobileMenuOpen" class="mobile-menu-backdrop" @click="closeMobileMenu">
      <div class="mobile-menu-panel" @click.stop>
        <button class="mobile-menu-item" type="button" @click="handleToggleSearch">
          <span class="mobile-menu-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="5.5" stroke="currentColor" stroke-width="1.8" />
              <path
                d="M15.5 15.5 20 20"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span>{{ isTutorAccount ? 'Zobacz innych nauczycieli' : 'Szukaj korepetycji' }}</span>
        </button>
        <button class="mobile-menu-item" type="button" @click="handleToggleRank">
          <span class="mobile-menu-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 4h12v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V4Z"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path d="M8 20h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </span>
          <span>Ranking</span>
        </button>
        <button class="mobile-menu-item" type="button" @click="handleToggleTeachers">
          <span class="mobile-menu-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path
                d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path
                d="M4 19a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span>{{ isTutorAccount ? 'Moi studenci' : 'Moi nauczyciele' }}</span>
        </button>
        <button class="mobile-menu-item" type="button" @click="handleToggleCalendar">
          <span class="mobile-menu-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="4"
                y="5"
                width="16"
                height="15"
                rx="2"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path
                d="M8 3v4M16 3v4M4 10h16"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span>Kalendarz</span>
        </button>
      </div>
    </div>

    <div class="main-content-area">
      <template v-if="['home', 'user-profile'].includes(route.name)">
        <MainContent
          :selected-filters="selectedFilters"
          :liked-teachers="likedTeachers"
          :show-search="!isTutorAccount"
          :is-tutor-account="isTutorAccount"
          @update:selected-filters="selectedFilters = $event"
          @show-teacher="showTeacherProfile"
          @like-teacher="handleTeacherLike"
          @remove-liked-teacher="removeLikedTeacher"
          @open-auth="() => openAuthModal('login')"
        />
      </template>

      <template v-else>
        <router-view />
      </template>
    </div>

    <CzatCzatSahur />

    <button
      v-if="!shouldHideSettingsFab"
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
  padding: 0 0 20px;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 50;
  padding: 16px 0 0;
}

.search-block {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 6px;
  flex-wrap: nowrap;
  flex: 0 1 auto;
  justify-content: flex-end;
  min-width: 0;
  max-width: min(100%, 280px);
  position: relative;
  z-index: 60;
  overflow: visible;
}

.mobile-menu-trigger {
  display: none;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-soft) 100%);
  color: var(--text-strong);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.1);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.mobile-menu-trigger:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.14);
  border-color: var(--primary-color);
}

.mobile-menu-trigger-icon {
  width: 22px;
  height: 22px;
}

.mobile-menu-backdrop {
  display: none;
}

.Korker {
  display: inline-flex;
  flex-shrink: 0;
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

@media (max-width: 768px) {
  .top-row {
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    padding: 12px 0 0;
  }

  .Korker {
    width: auto;
    align-self: center;
    flex-shrink: 0;
    margin-right: auto;
  }

  .search-block {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-wrap: nowrap;
    margin-left: auto;
    margin-right: 0;
    max-width: min(100%, 180px);
    overflow: visible;
  }

  .mobile-menu-trigger {
    display: inline-flex;
    width: 52px;
    height: 52px;
    min-width: 52px;
    min-height: 52px;
    aspect-ratio: 1 / 1;
  }

  .mobile-menu-backdrop {
    display: flex;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.24);
    z-index: 1400;
    padding: 84px 14px 14px;
    justify-content: flex-end;
    align-items: flex-start;
  }

  .mobile-menu-panel {
    display: grid;
    gap: 10px;
    width: min(86vw, 280px);
    padding: 12px;
    border-radius: 20px;
    background: var(--surface-strong);
    border: 1px solid var(--border);
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
  }

  .mobile-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 14px;
    border: none;
    border-radius: 14px;
    background: var(--surface-muted);
    color: var(--text-strong);
    font-size: 0.95rem;
    font-weight: 700;
    text-align: left;
    cursor: pointer;
  }

  .mobile-menu-item:active {
    transform: translateY(1px);
  }

  .mobile-menu-icon {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: rgba(79, 117, 199, 0.14);
    color: var(--primary-color);
    flex-shrink: 0;
  }

  .mobile-menu-icon svg {
    width: 17px;
    height: 17px;
  }

  .main-content-area {
    padding: 0 0 16px;
  }

  .settings-fab {
    width: 50px;
    height: 50px;
    bottom: 16px;
    left: 16px;
  }

  .settings-menu-backdrop {
    align-items: flex-end;
    justify-content: flex-start;
    padding: 16px 16px 92px 16px;
  }

  .settings-menu {
    width: min(100%, 320px);
  }
}
</style>
