<script setup>
import { ref, inject, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from '@/composables/useAuth.js'
import { useMessaging } from '@/composables/useMessaging.js'
import { blockUser, unblockUser, isBlockedByMe, isBlockingMe } from '@/services/blockService.js'
import { getAverageRating, getMyRatingForTutor, submitRating } from '@/services/ratingService.js'
import LoadingBox from '@/components/LoadingBox.vue'
import AvailabilityGrid from '@/components/AvailabilityGrid.vue'

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
const tutorOffers = ref([])
const loading = ref(true)
const error = ref('')
const blockedByMe = ref(false)
const blockingMe = ref(false)
const showBlockConfirm = ref(false)
const blockLoading = ref(false)
const showRatingEditor = ref(false)
const ratingDraft = ref(0)
const ratingSaving = ref(false)
const teacherRating = ref({ average: 0, count: 0 })
const myTeacherRating = ref(null)

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
    tutorOffers.value = tutorPost.value
      ? Array.isArray(tutorPost.value)
        ? tutorPost.value
        : [tutorPost.value]
      : []
    await checkBlockStatus(dataById.auth_id)
    await loadTeacherRating(dataById.auth_id)
    ratingDraft.value = myTeacherRating.value ?? 0
    loading.value = false
    return
  }

  profile.value = data
  tutorPost.value = data.tutor_post || null
  tutorOffers.value = tutorPost.value
    ? Array.isArray(tutorPost.value)
      ? tutorPost.value
      : [tutorPost.value]
    : []
  await checkBlockStatus(data.auth_id)
  await loadTeacherRating(data.auth_id)
  ratingDraft.value = myTeacherRating.value ?? 0
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

async function loadTeacherRating(tutorAuthId) {
  if (!tutorAuthId) {
    teacherRating.value = { average: 0, count: 0 }
    myTeacherRating.value = null
    return
  }

  try {
    const [summary, myRating] = await Promise.all([
      getAverageRating(tutorAuthId),
      getMyRatingForTutor(tutorAuthId),
    ])
    teacherRating.value = summary || { average: 0, count: 0 }
    myTeacherRating.value = myRating
  } catch {
    teacherRating.value = { average: 0, count: 0 }
    myTeacherRating.value = null
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

function getTeachingFormats(offer) {
  const tp = offer || tutorPost.value
  if (!tp) return []
  if (Array.isArray(tp.teachingFormats)) return tp.teachingFormats
  if (tp.teachingFormat) return [tp.teachingFormat]
  return []
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

function setDraftRating(value) {
  ratingDraft.value = Number(value)
}

function toggleRatingEditor() {
  if (!profile.value?.auth_id) return
  if (!showRatingEditor.value) {
    ratingDraft.value = myTeacherRating.value ?? 0
  }
  showRatingEditor.value = !showRatingEditor.value
}

async function submitTeacherRating() {
  if (!profile.value?.auth_id) return
  ratingSaving.value = true
  try {
    await submitRating(profile.value.auth_id, Number(ratingDraft.value))
    await loadTeacherRating(profile.value.auth_id)
    showRatingEditor.value = false
  } catch (e) {
    console.error('submitTeacherRating error:', e)
  } finally {
    ratingSaving.value = false
  }
}

function getStarFill(rating, index) {
  const diff = Number(rating || 0) - index
  if (diff >= 1) return 'filled'
  if (diff >= 0.5) return 'half'
  return 'empty'
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
          <h2 class="profile-name">{{ getFullName() || profile?.nickname || 'Nieznany' }}</h2>
          <span v-if="profile?.nickname && getFullName()" class="profile-nickname">{{
            profile.nickname
          }}</span>

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

          <div v-if="profile?.account_type === 'tutor'" class="rating-block">
            <div class="rating-header">
              <span class="rating-title">Ocena korepetytora</span>
              <span class="rating-summary"
                >{{ teacherRating.average ? teacherRating.average.toFixed(1) : 'Brak' }} / 5</span
              >
            </div>
            <div
              class="rating-stars"
              :aria-label="`Średnia ocena ${teacherRating.average || 0} z 5`"
            >
              <span
                v-for="i in 5"
                :key="i"
                class="star"
                :class="getStarFill(teacherRating.average, i)"
                >★</span
              >
            </div>
            <div class="rating-meta">
              <span v-if="teacherRating.count">{{ teacherRating.count }} ocen</span>
              <span v-else>Brak ocen</span>
            </div>
            <div v-if="myTeacherRating != null" class="rating-my">
              Twoja ocena: {{ myTeacherRating }}/5
            </div>
            <button
              v-if="profile && user?.id !== profile.auth_id && !blockedByMe && !blockingMe"
              class="btn btn-secondary rating-action"
              type="button"
              @click="toggleRatingEditor"
            >
              {{ myTeacherRating != null ? 'Zmień ocenę' : 'Oceń' }}
            </button>
            <div v-if="showRatingEditor" class="rating-editor">
              <div class="rating-options">
                <button
                  v-for="value in [1, 2, 3, 4, 5]"
                  :key="value"
                  class="rating-option"
                  :class="{ active: ratingDraft === value }"
                  type="button"
                  @click="setDraftRating(value)"
                >
                  {{ value }}★
                </button>
              </div>
              <button
                class="btn btn-primary rating-submit"
                :disabled="ratingSaving"
                @click="submitTeacherRating"
              >
                {{ ratingSaving ? '...' : 'Zapisz ocenę' }}
              </button>
            </div>
          </div>

          <div style="gap: 8px; display: flex; flex-direction: column; width: 100%">
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
              @click="router.push({ path: '/', query: { panel: 'profile' } })"
            >
              Edytuj profil
            </button>
            <button
              v-if="
                profile &&
                user?.id === profile.auth_id &&
                profile?.account_type === 'tutor' &&
                tutorOffers.length > 0 &&
                tutorOffers[0]?.weeklyAvailability &&
                Object.keys(tutorOffers[0].weeklyAvailability).length
              "
              class="btn btn-secondary message-btn"
              @click="router.push({ path: '/', query: { panel: 'profile', edit: '1' } })"
            >
              Edytuj dostępność
            </button>
          </div>
        </div>

        <div class="profile-right">
          <template v-if="profile?.account_type === 'tutor'">
            <template v-if="tutorOffers.length">
              <div v-for="(offer, index) in tutorOffers" :key="index" class="tutor-offer-view">
                <h4>Oferta korepetytora{{ tutorOffers.length > 1 ? ' ' + (index + 1) : '' }}</h4>

                <div v-if="offer.subject" class="offer-row">
                  <span class="offer-label">Przedmiot</span>
                  <span class="offer-value">{{ offer.subject }}</span>
                </div>
                <div v-if="offer.level" class="offer-row">
                  <span class="offer-label">Poziom</span>
                  <span class="offer-value">{{ offer.level }}</span>
                </div>
                <div v-if="offer.price" class="offer-row">
                  <span class="offer-label">Stawka</span>
                  <span class="offer-value">{{ offer.price }} zł/h</span>
                </div>
                <div v-if="getTeachingFormats(offer).length" class="offer-row">
                  <span class="offer-label">Forma</span>
                  <span class="offer-value">{{ getTeachingFormats(offer).join(', ') }}</span>
                </div>
                <div v-if="offer.description" class="offer-row offer-description">
                  <span class="offer-label">Opis</span>
                  <span class="offer-value desc-text">{{ offer.description }}</span>
                </div>
                <div v-if="offer.photo" class="offer-photo-preview">
                  <img :src="offer.photo" alt="Zdjęcie oferty" />
                </div>

                <div
                  v-if="offer.weeklyAvailability && Object.keys(offer.weeklyAvailability).length"
                >
                  <AvailabilityGrid :availability="offer.weeklyAvailability" readonly />
                </div>
              </div>
            </template>
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
  grid-template-columns: 300px minmax(0, 1fr);
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

.rating-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
}

.rating-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.rating-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
}

.rating-summary {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary-color);
}

.rating-stars {
  display: flex;
  gap: 4px;
  font-size: 1.1rem;
}

.star {
  color: #cbd5e1;
}

.star.filled {
  color: #fbbf24;
}

.star.half {
  color: #fbbf24;
}

.rating-meta,
.rating-my {
  font-size: 0.85rem;
  color: var(--muted);
}

.rating-action {
  width: 100%;
}

.rating-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rating-option {
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-strong);
  color: var(--text);
  padding: 6px 10px;
  cursor: pointer;
}

.rating-option.active {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.rating-submit {
  width: 100%;
}

.profile-name {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: var(--text);
  text-align: center;
  word-break: break-word;
}

.profile-real-name,
.profile-nickname {
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
