<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import MenuContent from '@/components/MenuContent.vue'
import ProfilePage from './menu/ProfilePage.vue'
import Ranks from './menu/Ranks.vue'
import FilterPage from './menu/FilterPage.vue'
import MyTeachers from './menu/MyTeachers.vue'
import { toggleFilter, toggleProfile, toggleRank, toggleTeachers } from '../composables/menuToggle'

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

const emit = defineEmits([
  'update:selectedFilters',
  'go-to-search',
  'show-teacher',
  'remove-liked-teacher',
  'openAuth',
])

const route = useRoute()
const router = useRouter()
const { isAuthenticated, needsProfile, openAuthModal } = useAuth()

const active = ref(null)

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
  else if (route.path === '/nauczyciele') activateProtectedPanel('teachers')
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
    else if (path === '/nauczyciele') activateProtectedPanel('teachers')
    else if (path === '/' && (active.value === 'profile' || active.value === 'teachers')) {
      active.value = null
    }
  },
)

function updateFilters(filters) {
  emit('update:selectedFilters', filters)
}

function handleToggleFilter() {
  toggleFilter(route, router, active)
}

function handleToggleRank() {
  toggleRank(route, router, active)
}

function confirmFilters() {
  active.value = null
}
</script>

<template>
  <div class="content-row">
    <div class="left-side">
      <MenuContent
        @toggle-profile="() => toggleProfile(route, router)"
        @toggle-rank="handleToggleRank"
        @toggle-filter="handleToggleFilter"
        @toggle-teachers="() => toggleTeachers(route, router)"
        @go-to-search-page="emit('go-to-search')"
        @open-auth="emit('openAuth')"
      />
    </div>
    <div class="right-side">
      <Transition name="fade" mode="out-in">
        <ProfilePage v-if="activePanel === 'profile'" key="profile" />
        <Ranks v-else-if="activePanel === 'ranks'" key="ranks" />
        <FilterPage
          v-else-if="activePanel === 'filter'"
          key="filter"
          :model-value="selectedFilters"
          @update:model-value="updateFilters"
          @confirm="confirmFilters"
        />
        <MyTeachers
          v-else-if="activePanel === 'teachers'"
          key="teachers"
          :teachers="likedTeachers"
          @show-teacher="(t) => emit('show-teacher', t)"
          @remove-teacher="(t) => emit('remove-liked-teacher', t)"
        />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.content-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.left-side {
  flex-shrink: 0;
}

.right-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}
</style>
