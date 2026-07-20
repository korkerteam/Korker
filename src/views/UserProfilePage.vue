<script setup>
import { ref, inject, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from '@/composables/useAuth.js'
import { useMessaging } from '@/composables/useMessaging.js'
import { blockUser, unblockUser, isBlockedByMe, isBlockingMe } from '@/services/blockService.js'
import LoadingBox from '@/components/LoadingBox.vue'

const props = defineProps({
  likedTeachers: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['like-teacher', 'remove-liked-teacher'])

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated, profileData: myProfile, openAuthModal } = useAuth()
const { refreshBlockedIds } = useMessaging()

const profile = ref(null)
const tutorPost = ref(null)
const loading = ref(true)
const error = ref('')
const blockedByMe = ref(false)
const blockingMe = ref(false)
const showBlockConfirm = ref(false)
const blockLoading = ref(false)

const weeklyDayLabels = [
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
  'Niedziela',
]

const globalChat = inject('globalChat')

onMounted(async () => {
  const identifier = route.params.nickname
  if (!identifier) {
    error.value = 'Nie znaleziono użytkownika'
    loading.value = false
    return
  }
  await fetchProfile(identifier)
})

watch(
  () => route.params.nickname,
  (nickname) => {
    if (nickname) fetchProfile(nickname)
  },
)

async function fetchProfile(identifier) {
  loading.value = true
  error.value = ''
  blockedByMe.value = false
  blockingMe.value = false

  const { data, error: err } = await supabase
    .from('users')
    .select('*')
    .eq('nickname', identifier)
    .maybeSingle()

  if (err) {
    error.value = 'Błąd podczas ładowania profilu'
    console.error('fetchProfile error:', err)
    loading.value = false
    return
  }

  if (!data) {
    const { data: dataById, error: errById } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', identifier)
      .maybeSingle()

    if (errById || !dataById) {
      error.value = 'Nie znaleziono użytkownika'
      loading.value = false
      return
    }

    profile.value = dataById
    tutorPost.value = dataById.tutor_post || null
    await checkBlockStatus(dataById.auth_id)
    loading.value = false
    return
  }

  profile.value = data
  tutorPost.value = data.tutor_post || null
  await checkBlockStatus(data.auth_id)
  loading.value = false
}

async function checkBlockStatus(targetAuthId) {
  if (!user.value || user.value.id === targetAuthId) return
  try {
    const [byMe, toMe] = await Promise.all([
      isBlockedByMe(targetAuthId),
      isBlockingMe(targetAuthId),
    ])
    blockedByMe.value = byMe
    blockingMe.value = toMe
  } catch {
    // ignore — profile still loads
  }
}

async function handleBlock() {
  if (!profile.value) return
  blockLoading.value = true
  try {
    await blockUser(profile.value.auth_id)
    blockedByMe.value = true
    showBlockConfirm.value = false
    await refreshBlockedIds()
  } catch (e) {
    console.error('blockUser error:', e)
  } finally {
    blockLoading.value = false
  }
}

async function handleUnblock() {
  if (!profile.value) return
  blockLoading.value = true
  try {
    await unblockUser(profile.value.auth_id)
    blockedByMe.value = false
    await refreshBlockedIds()
  } catch (e) {
    console.error('unblockUser error:', e)
  } finally {
    blockLoading.value = false
  }
}

const isLiked = computed(() => {
  if (!profile.value) return false
  const pid = profile.value.auth_id || profile.value.id
  if (!pid) return false
  return props.likedTeachers.some((t) => {
    const tid = t.auth_id || t.id
    return tid && String(tid) === String(pid)
  })
})

const canAddTeacher = computed(() => {
  if (!profile.value || !user.value) return false
  const viewerType = `${myProfile.value?.account_type || ''}`.toLowerCase()
  const profileType = `${profile.value.account_type || ''}`.toLowerCase()
  const viewerIsTutor = viewerType.includes('tutor')
  const profileIsTutor = profileType.includes('tutor')
  return viewerIsTutor !== profileIsTutor
})

function toggleLike() {
  if (!profile.value) return
  const pid = profile.value.auth_id || profile.value.id
  if (!pid) return
  if (isLiked.value) {
    emit('remove-liked-teacher', profile.value)
  } else {
    emit('like-teacher', profile.value)
  }
}

function getDisplayName() {
  if (!profile.value) return ''
  return (
    profile.value.nickname ||
    [profile.value.name, profile.value.surname].filter(Boolean).join(' ') ||
    'Nieznany'
  )
}

function getFullName() {
  if (!profile.value) return ''
  return [profile.value.name, profile.value.surname].filter(Boolean).join(' ') || ''
}

function getInitial() {
  const name = profile.value?.nickname || profile.value?.name || ''
  return name.charAt(0)?.toUpperCase() || '?'
}

function formattedLocation() {
  return tutorPost.value?.city || profile.value?.city || ''
}

function getTeachingFormats() {
  if (!tutorPost.value) return []
  if (Array.isArray(tutorPost.value.teachingFormats)) return tutorPost.value.teachingFormats
  if (tutorPost.value.teachingFormat) return [tutorPost.value.teachingFormat]
  return []
}

function isCellSelected(day, hour) {
  const slot = `${String(hour).padStart(2, '0')}:00-${String((hour + 1) % 24).padStart(2, '0')}:00`
  return (tutorPost.value?.weeklyAvailability?.[day] || []).includes(slot)
}

function visibleHours() {
  return Array.from({ length: 24 }, (_, h) => h)
}

function handleSendMessage() {
  if (!isAuthenticated.value) {
    openAuthModal()
    return
  }
  if (!profile.value) return
  if (user.value?.id === profile.value.auth_id) return
  globalChat.openChatWithUser(profile.value.auth_id)
}
</script>

<template>
  <div class="profile-page">
    <LoadingBox v-if="loading" />

    <div v-else-if="error" class="page-error">
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="router.push('/')">Wróć do strony głównej</button>
    </div>

    <div v-else class="profile-container">
      <div v-if="blockingMe" class="blocked-notice">
        <p>Ten użytkownik Cię zablokował. Nie możesz zobaczyć tego profilu.</p>
        <button class="btn btn-secondary" @click="router.push('/')">Wróć do strony głównej</button>
      </div>

      <div v-else-if="blockedByMe" class="blocked-notice">
        <p>Zablokowałeś tego użytkownika.</p>
        <div class="blocked-actions">
          <button class="btn btn-secondary" :disabled="blockLoading" @click="handleUnblock">
            {{ blockLoading ? '...' : 'Odblokuj' }}
          </button>
          <button class="btn btn-secondary" @click="router.push('/')">
            Wróć do strony głównej
          </button>
        </div>
      </div>

      <div v-else class="profile-card">
        <div class="profile-left">
          <div class="avatar-wrapper">
            <img
              v-if="profile?.profile_picture"
              :src="profile.profile_picture"
              :alt="getDisplayName()"
              class="avatar"
            />
            <span v-else class="avatar avatar-letter">{{ getInitial() }}</span>
          </div>
          <h2 class="profile-name">{{ getDisplayName() }}</h2>
          <span
            v-if="getFullName() && getDisplayName() !== getFullName()"
            class="profile-real-name"
            >{{ getFullName() }}</span
          >

          <div class="info-list">
            <div v-if="profile?.account_type" class="info-item">
              <span class="info-label">Typ konta</span>
              <span class="info-value">{{
                profile.account_type === 'tutor' ? 'Korepetytor' : 'Student'
              }}</span>
            </div>
            <div v-if="profile?.age" class="info-item">
              <span class="info-label">Wiek</span>
              <span class="info-value">{{ profile.age }}</span>
            </div>
            <div v-if="formattedLocation()" class="info-item">
              <span class="info-label">Miasto</span>
              <span class="info-value">{{ formattedLocation() }}</span>
            </div>
            <div v-if="profile?.gender" class="info-item">
              <span class="info-label">Płeć</span>
              <span class="info-value">{{
                profile.gender === 'male'
                  ? 'Mężczyzna'
                  : profile.gender === 'female'
                    ? 'Kobieta'
                    : ''
              }}</span>
            </div>
          </div>

          <button
            v-if="profile && user?.id !== profile.auth_id && canAddTeacher"
            class="btn save-btn"
            :class="{ saved: isLiked }"
            @click="toggleLike"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                v-if="!isLiked"
                d="M12 5v14m-7-7h14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                v-else
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ isLiked ? 'Dodano' : 'Dodaj' }}
          </button>
          <button
            v-if="profile && user?.id !== profile.auth_id && !blockedByMe && !blockingMe"
            class="btn btn-primary message-btn"
            @click.stop="handleSendMessage"
          >
            Wyślij wiadomość
          </button>
          <button
            v-if="profile && user?.id !== profile.auth_id && !blockedByMe"
            class="btn block-btn"
            @click="showBlockConfirm = true"
          >
            Zablokuj użytkownika
          </button>
          <button
            v-if="profile && user?.id === profile.auth_id"
            class="btn btn-primary message-btn"
            style="background: var(--muted); cursor: default; opacity: 0.5"
          >
            To Twój profil
          </button>
        </div>

        <div class="profile-right">
          <template v-if="profile?.account_type === 'tutor'">
            <div v-if="tutorPost" class="tutor-offer-view">
              <h4>Oferta korepetytora</h4>

              <div v-if="tutorPost.subject" class="offer-row">
                <span class="offer-label">Przedmiot</span>
                <span class="offer-value">{{ tutorPost.subject }}</span>
              </div>
              <div v-if="tutorPost.level" class="offer-row">
                <span class="offer-label">Poziom</span>
                <span class="offer-value">{{ tutorPost.level }}</span>
              </div>
              <div v-if="tutorPost.price" class="offer-row">
                <span class="offer-label">Stawka</span>
                <span class="offer-value">{{ tutorPost.price }} zł/h</span>
              </div>
              <div v-if="getTeachingFormats().length" class="offer-row">
                <span class="offer-label">Forma</span>
                <span class="offer-value">{{ getTeachingFormats().join(', ') }}</span>
              </div>
              <div v-if="tutorPost.description" class="offer-row offer-description">
                <span class="offer-label">Opis</span>
                <span class="offer-value desc-text">{{ tutorPost.description }}</span>
              </div>
              <div v-if="tutorPost.photo" class="offer-photo-preview">
                <img :src="tutorPost.photo" alt="Zdjęcie oferty" />
              </div>

              <div
                v-if="
                  tutorPost.weeklyAvailability && Object.keys(tutorPost.weeklyAvailability).length
                "
                class="availability-section"
              >
                <span class="offer-label">Dostępność</span>
                <div class="av-grid">
                  <div class="av-header-cell av-corner"></div>
                  <div
                    v-for="day in weeklyDayLabels"
                    :key="day"
                    class="av-header-cell av-day-header"
                  >
                    {{ day }}
                  </div>
                  <template v-for="hour in visibleHours()" :key="hour">
                    <div class="av-header-cell av-time-header">
                      {{ String(hour).padStart(2, '0') }}:00
                    </div>
                    <div
                      v-for="day in weeklyDayLabels"
                      :key="`${day}-${hour}`"
                      class="av-cell"
                      :class="{ selected: isCellSelected(day, hour) }"
                    ></div>
                  </template>
                </div>
              </div>
            </div>
            <div v-else class="tutor-offer-view tutor-offer-empty">
              <h4>Oferta korepetytora</h4>
              <p class="empty-offer-text">Ten korepetytor nie ma jeszcze opublikowanej oferty.</p>
            </div>
          </template>
          <template v-else>
            <div class="tutor-offer-view tutor-offer-empty">
              <h4>{{ getDisplayName() }}</h4>
              <p class="empty-offer-text">Użytkownik nie jest korepetytorem.</p>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="showBlockConfirm" class="block-overlay" @click.self="showBlockConfirm = false">
      <div class="block-dialog">
        <h3>Zablokuj użytkownika</h3>
        <p>
          Czy na pewno chcesz zablokować tego użytkownika? Nie będzie on mógł zobaczyć Twojego
          profilu ani wysyłać Ci wiadomości.
        </p>
        <div class="block-dialog-actions">
          <button
            class="btn btn-secondary"
            :disabled="blockLoading"
            @click="showBlockConfirm = false"
          >
            Anuluj
          </button>
          <button class="btn block-confirm-btn" :disabled="blockLoading" @click="handleBlock">
            {{ blockLoading ? '...' : 'Zablokuj' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  padding: 12px 0;
  min-height: 0;
  width: 100%;
}

.page-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 20px;
  color: var(--muted);
  font-size: 16px;
}

.profile-container {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 20px;
}

.profile-card {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.profile-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 28px 16px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow-soft);
  position: sticky;
  top: 12px;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border);
  display: block;
  background: var(--surface-soft);
}

.avatar-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent);
  color: #ffffff;
  font-size: 42px;
  font-weight: 700;
  border: 3px solid var(--border);
  width: 110px;
  height: 110px;
}

.profile-name {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: var(--text);
  text-align: center;
  word-break: break-word;
}

.profile-real-name {
  font-size: 14px;
  color: var(--muted);
  text-align: center;
  margin-top: -8px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.info-label {
  font-weight: 600;
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.info-value {
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  text-align: right;
}

.profile-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0;
  min-width: 0;
}

.tutor-offer-view {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--shadow-soft);
}

.tutor-offer-empty {
  align-items: center;
  text-align: center;
  padding: 48px 28px;
}

.tutor-offer-view h4 {
  margin: 0;
  font-size: 18px;
  color: var(--text);
  font-weight: 700;
}

.empty-offer-text {
  color: var(--muted);
  font-size: 15px;
  margin: 0;
}

.offer-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 15px;
}

.offer-label {
  font-weight: 600;
  color: var(--muted);
  flex-shrink: 0;
}

.offer-value {
  text-align: right;
  color: var(--text);
}

.offer-description {
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.desc-text {
  text-align: left;
  white-space: pre-wrap;
  font-size: 15px;
  line-height: 1.6;
  max-height: 150px;
  overflow-y: auto;
}

.offer-photo-preview {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  max-width: 280px;
}

.offer-photo-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.availability-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.av-grid {
  display: grid;
  grid-template-columns: 44px repeat(7, 1fr);
  grid-auto-rows: 22px;
  gap: 2px;
  padding: 4px;
  background: #f3f4f6;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  overflow: auto;
  user-select: none;
}

.av-header-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: #fff;
  border-radius: 3px;
  padding: 2px;
}

.av-corner {
  background: transparent;
}

.av-day-header {
  background: #f9fafb;
  font-size: 9px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.av-time-header {
  background: transparent;
  color: #9ca3af;
}

.av-cell {
  border-radius: 3px;
  background: #fff;
  border: 1px solid #e5e7eb;
  min-width: 0;
}

.av-cell.selected {
  background: var(--accent);
  border-color: var(--accent);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  transition:
    background 0.2s,
    box-shadow 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: #ffffff;
}

.btn-primary:hover {
  background: var(--accent);
}

.btn-secondary {
  background: var(--accent-soft);
  color: var(--text);
}

.btn-secondary:hover {
  background: rgba(138, 180, 255, 0.2);
}

.message-btn {
  width: 100%;
  padding: 12px;
}
.save-btn {
  width: 100%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--surface-strong);
  color: var(--muted);
  border: 1px solid var(--border);
}
.save-btn:hover {
  background: rgba(79, 117, 199, 0.08);
  color: var(--accent);
  border-color: rgba(79, 117, 199, 0.3);
}
.save-btn.saved {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.save-btn.saved:hover {
  background: var(--accent-strong);
  border-color: var(--accent-strong);
}
.block-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  color: #ef4444;
  border: 1px solid #fca5a5;
  border-radius: 999px;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}
.block-btn:hover {
  background: rgba(239, 68, 68, 0.08);
}
.blocked-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 20px;
  text-align: center;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 16px;
  max-width: 480px;
  margin: 0 auto;
}
.blocked-notice p {
  color: var(--muted);
  font-size: 16px;
  margin: 0;
}
.blocked-actions {
  display: flex;
  gap: 12px;
}
.block-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.block-dialog {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}
.block-dialog h3 {
  margin: 0 0 12px;
  font-size: 18px;
  color: var(--text);
}
.block-dialog p {
  margin: 0 0 20px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}
.block-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.block-confirm-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  background: #ef4444;
  color: #ffffff;
  transition: background 0.2s;
}
.block-confirm-btn:hover {
  background: #dc2626;
}
.block-confirm-btn:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
@media (max-width: 768px) {
  .profile-page {
    padding: 8px 0 16px;
  }

  .profile-container {
    padding: 0 12px;
  }

  .profile-card {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .profile-left {
    position: static;
    padding: 18px 14px;
    gap: 12px;
  }

  .avatar,
  .avatar-letter {
    width: 92px;
    height: 92px;
  }

  .avatar-letter {
    font-size: 34px;
  }

  .profile-name {
    font-size: 20px;
  }

  .profile-real-name {
    font-size: 13px;
    margin-top: -4px;
  }

  .info-list {
    gap: 8px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .info-value {
    text-align: left;
  }

  .message-btn,
  .save-btn,
  .block-btn {
    padding: 11px 12px;
  }

  .tutor-offer-view {
    padding: 18px 14px;
    gap: 10px;
  }

  .tutor-offer-empty {
    padding: 24px 14px;
  }

  .offer-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    font-size: 14px;
  }

  .offer-value {
    text-align: left;
  }

  .offer-description {
    margin-top: 2px;
    padding-top: 10px;
  }

  .desc-text {
    font-size: 14px;
    max-height: 120px;
  }

  .offer-photo-preview {
    max-width: 100%;
  }

  .availability-section {
    gap: 6px;
  }

  .av-grid {
    grid-template-columns: 36px repeat(7, minmax(22px, 1fr));
    gap: 1px;
    padding: 3px;
  }

  .av-header-cell {
    font-size: 9px;
    padding: 1px;
  }

  .av-day-header {
    font-size: 7px;
  }

  .blocked-notice {
    padding: 28px 16px;
    margin: 0 8px;
  }

  .blocked-actions {
    flex-direction: column;
    width: 100%;
  }

  .block-dialog {
    padding: 20px 16px;
  }

  .block-dialog-actions {
    flex-direction: column-reverse;
  }
}
</style>
