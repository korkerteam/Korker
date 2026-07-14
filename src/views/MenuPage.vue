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
    <!-- LEWY PANEL (Twoje odzyskane przyciski!) -->
    <div class="left-side">
      <MenuContent
        @toggle-profile="() => toggleProfile(route, router)"
        @toggle-rank="handleToggleRank"
        @toggle-teachers="handleToggleTeachers"
        @toggle-search="handleToggleSearch"
        @open-auth="emit('openAuth')"
      />
    </div>

    <!-- PRAWY PANEL (Dynamiczna zawartość) -->
    <div class="right-side">
      <Transition name="fade" mode="out-in">
        <ProfilePage v-if="activePanel === 'profile'" key="profile" />
        <Ranks v-else-if="activePanel === 'ranks'" key="ranks" />
        <FindKorks
          v-else-if="activePanel === 'search'"
          key="search"
          :filters="selectedFilters"
          :liked-teachers="likedTeachers"
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
        <!-- Tutaj ładuje się właściwy HomePage -->
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
  overflow-y: visible;
  overflow-x: hidden;
}
</style>
