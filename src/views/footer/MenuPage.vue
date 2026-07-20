<script setup>
import { computed, ref, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import MenuContent from '@/components/MenuContent.vue'
import HomePage from '@/views/footer/HomePage.vue'
import ProfilePage from '@/views/menu/ProfilePage.vue'
import Ranks from '@/views/menu/Ranks.vue'
import MyTeachers from '@/views/menu/MyTeachers.vue'
import FindKorks from '@/views/menu/FindKorks.vue'
import CalendarView from '@/views/menu/CalendarView.vue'
import UserProfilePage from '@/views/UserProfilePage.vue'
import { toggleProfile, toggleRank, toggleTeachers } from '@/composables/menuToggle.js'

const props = defineProps({
  selectedFilters: {
    type: Object,
    default: () => ({ subjects: [], levels: [], tags: [] }),
  },
  likedTeachers: {
    type: Array,
    default: () => [],
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  isTutorAccount: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['show-teacher', 'remove-liked-teacher', 'like-teacher', 'openAuth'])

const route = useRoute()
const router = useRouter()
const { isAuthenticated, needsProfile, openAuthModal } = useAuth()

const homeTrigger = inject('homeTrigger')

const calendarResetKey = ref(0)

const currentPanel = computed(() => route.query.panel || null)

watch(homeTrigger, () => {
  if (route.path !== '/') router.push('/')
  else if (route.query.panel) router.replace('/')
})

watch(isAuthenticated, (val) => {
  if (!val && route.query.panel) {
    router.push('/')
  }
})

watch(needsProfile, (val) => {
  if (val && route.query.panel !== 'profile') {
    router.push({ path: '/', query: { panel: 'profile' } })
  }
})

watch(
  () => route.query.search,
  (search) => {
    const shouldOpen = search !== undefined && search !== '0' && search !== 'false' && search !== ''
    if (shouldOpen) {
      router.replace({ path: '/', query: { panel: 'search' } })
    }
  },
  { immediate: true },
)

function requireAuth() {
  if (!isAuthenticated.value) {
    openAuthModal()
    return false
  }
  return true
}

function navigateToPanel(panel) {
  if (currentPanel.value === panel) {
    router.push('/')
  } else {
    router.push({ path: '/', query: { panel } })
  }
}

function handleToggleProfile() {
  toggleProfile(route, router)
}

function handleToggleRank() {
  toggleRank(route, router)
}

function handleToggleTeachers() {
  if (!requireAuth()) return
  toggleTeachers(route, router)
}

function handleToggleSearch() {
  navigateToPanel('search')
}

function handleToggleCalendar() {
  if (!requireAuth()) return
  if (currentPanel.value === 'calendar') {
    calendarResetKey.value++
  } else {
    navigateToPanel('calendar')
  }
}
</script>

<template>
  <div class="content-row">
    <div class="left-side">
      <MenuContent
        :show-search="props.showSearch"
        :is-tutor-account="props.isTutorAccount"
        @toggle-profile="handleToggleProfile"
        @toggle-rank="handleToggleRank"
        @toggle-teachers="handleToggleTeachers"
        @toggle-search="handleToggleSearch"
        @toggle-calendar="handleToggleCalendar"
        @open-auth="emit('openAuth')"
      />
    </div>

    <div class="right-side">
      <Transition name="fade" mode="out-in">
        <ProfilePage v-if="currentPanel === 'profile'" key="profile" />
        <Ranks v-else-if="currentPanel === 'ranks'" key="ranks" />
        <FindKorks
          v-else-if="currentPanel === 'search'"
          key="search"
          :filters="props.selectedFilters"
          :liked-teachers="props.likedTeachers"
          :is-tutor-account="props.isTutorAccount"
          @close="handleToggleSearch"
          @like-teacher="(t) => emit('like-teacher', t)"
        />
        <MyTeachers
          v-else-if="currentPanel === 'teachers'"
          key="teachers"
          :teachers="props.likedTeachers"
          :is-tutor-account="props.isTutorAccount"
          @show-teacher="(t) => emit('show-teacher', t)"
          @remove-teacher="(t) => emit('remove-liked-teacher', t)"
        />
        <CalendarView
          v-else-if="currentPanel === 'calendar'"
          key="calendar"
          :is-tutor-account="props.isTutorAccount"
          :reset-key="calendarResetKey"
        />
        <UserProfilePage
          v-else-if="route.name === 'user-profile'"
          :key="route.params.nickname"
          :liked-teachers="props.likedTeachers"
          @like-teacher="(t) => emit('like-teacher', t)"
          @remove-liked-teacher="(t) => emit('remove-liked-teacher', t)"
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
  padding: 23px 0;
  width: 100%;
  overflow-y: visible;
  overflow-x: hidden;
}

@media (max-width: 900px) {
  .content-row {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .left-side {
    order: 2;
  }

  .right-side {
    order: 1;
    padding: 12px 0 18px;
    gap: 12px;
  }
}
</style>
