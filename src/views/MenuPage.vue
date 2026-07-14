<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import MenuContent from '@/components/MenuContent.vue'
import HomePage from '@/views/HomePage.vue'
import ProfilePage from './menu/ProfilePage.vue'
import Ranks from './menu/Ranks.vue'
import MyTeachers from './menu/MyTeachers.vue'
import FindKorks from './menu/FindKorks.vue'
import { toggleProfile, toggleRank } from '../composables/menuToggle'

defineProps({
  selectedFilters: {
    type: Object,
    default: () => ({ subjects: [], levels: [], tags: [] }),
  },
  likedTeachers: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['show-teacher', 'remove-liked-teacher', 'like-teacher', 'openAuth'])

const route = useRoute()
const router = useRouter()
const { isAuthenticated, needsProfile, openAuthModal } = useAuth()

const homeTrigger = inject('homeTrigger')
const active = ref(null)

watch(homeTrigger, () => {
  active.value = null
  if (route.path !== '/') router.push('/')
})

const activePanel = computed(() => active.value)

function activateProtectedPanel(panel) {
  if (!isAuthenticated.value) {
    openAuthModal()
    router.push('/')
    return
  }
  active.value = panel
}

onMounted(() => {
  if (route.path === '/profil') activateProtectedPanel('profile')
})

watch(isAuthenticated, (val) => {
  if (!val) active.value = null
})

watch(needsProfile, (val) => {
  if (val) router.push('/profil')
})

watch(
  () => route.path,
  (path) => {
    if (path === '/profil') activateProtectedPanel('profile')
    else if (path === '/') {
      active.value = null
    }
  },
)

function requireAuth() {
  if (!isAuthenticated.value) {
    openAuthModal()
    router.push('/')
    return false
  }
  return true
}

function handleToggleRank() {
  toggleRank(route, router, active)
}

function handleToggleTeachers() {
  if (!requireAuth()) return
  active.value = active.value === 'teachers' ? null : 'teachers'
}

function handleToggleSearch() {
  if (!requireAuth()) return
  active.value = active.value === 'search' ? null : 'search'
}
</script>

<template>
  <div class="content-row">
    <div class="left-side">
      <MenuContent
        @toggle-profile="() => toggleProfile(route, router)"
        @toggle-rank="handleToggleRank"
        @toggle-teachers="handleToggleTeachers"
        @toggle-search="handleToggleSearch"
        @open-auth="emit('openAuth')"
      />
    </div>

    <div class="right-side">
      <Transition name="fade" mode="out-in">
        <ProfilePage v-if="activePanel === 'profile'" key="profile" />
        <Ranks v-else-if="activePanel === 'ranks'" key="ranks" />
        <FindKorks
          v-else-if="activePanel === 'search'"
          key="search"
          :filters="selectedFilters"
          @close="handleToggleSearch"
          @like-teacher="(t) => emit('like-teacher', t)"
        />
        <MyTeachers
          v-else-if="activePanel === 'teachers'"
          key="teachers"
          :teachers="likedTeachers"
          @show-teacher="(t) => emit('show-teacher', t)"
          @remove-teacher="(t) => emit('remove-liked-teacher', t)"
        />
        <HomePage v-else key="home" />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.content-row {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 26px;
  align-items: stretch;
  min-height: 0;
  height: 100%;
}

.left-side {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  height: 100%;
  overflow: auto;
}

.right-side {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 0;
  align-items: stretch;
  justify-content: flex-start;
  padding: 28px 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.dashboard-shell {
  display: grid;
  gap: 24px;
  width: 100%;
  min-height: 100%;
}

.dashboard-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 26px 28px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.dashboard-welcome {
  margin: 0 0 6px;
  color: #4f75c7;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.dashboard-title {
  margin: 0;
  font-size: clamp(24px, 2.2vw, 32px);
  line-height: 1.1;
  color: #0f172a;
}

.dashboard-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.dashboard-action {
  border: none;
  border-radius: 16px;
  background: #2563eb;
  color: white;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.dashboard-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(37, 99, 235, 0.18);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 26px;
  padding: 24px;
  box-shadow: 0 22px 40px rgba(15, 23, 42, 0.07);
}

.dashboard-card h3 {
  margin: 0 0 14px;
  font-size: 18px;
  color: #0f172a;
}

.dashboard-card p,
.dashboard-card span {
  color: #475569;
  font-size: 14px;
}

.dashboard-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 14px;
}

.dashboard-card li {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.dashboard-card li:last-child {
  border-bottom: none;
}

.dashboard-card strong {
  color: #111827;
}
</style>
