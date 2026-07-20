<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from '@/composables/useAuth.js'

const router = useRouter()

const props = defineProps({
  isTutorAccount: {
    type: Boolean,
    default: false,
  },
  resetKey: {
    type: Number,
    default: 0,
  },
})

const { isAuthenticated, openAuthModal, user } = useAuth()

const todayDate = new Date()
const lessonRequests = ref([])
const userCache = ref({})
const loadingRequests = ref(false)
const dayKeys = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
const dayAbbr = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']
const gridHours = Array.from({ length: 24 }, (_, i) => i)
const selectedSlotRequest = ref(null)

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const currentWeekStart = ref(getMonday(todayDate))

const weekLabel = computed(() => {
  const start = currentWeekStart.value
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmtShort = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short' })
  const fmtYear = new Intl.DateTimeFormat('pl-PL', { year: 'numeric' })
  return `${fmtShort.format(start)} – ${fmtShort.format(end)} ${fmtYear.format(end)}`
})

const pendingRequests = computed(() => {
  if (!props.isTutorAccount) return []
  return lessonRequests.value.filter((r) => r.status === 'pending')
})

const cellRequests = computed(() => {
  const map = new Map()
  for (const req of lessonRequests.value) {
    if (!['pending', 'approved'].includes(req.status)) continue
    const masks = req.requested_slots
    if (!Array.isArray(masks)) continue
    for (let di = 0; di < masks.length; di++) {
      const mask = masks[di]
      if (typeof mask === 'number' && mask > 0) {
        for (let h = 0; h < 24; h++) {
          if (mask & (1 << h)) {
            const key = `${di}-${h}`
            const existing = map.get(key)
            if (!existing || (existing.status === 'approved' && req.status === 'pending')) {
              map.set(key, { request: req, status: req.status })
            }
          }
        }
      }
    }
  }
  return map
})

function slotLabelsFromMasks(masks) {
  const dayKeys = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']
  const labels = []
  if (!Array.isArray(masks)) return labels
  for (let di = 0; di < masks.length; di++) {
    const mask = masks[di]
    if (typeof mask === 'number' && mask > 0) {
      for (let h = 0; h < 24; h++) {
        if (mask & (1 << h)) {
          labels.push({ day: dayKeys[di], time: `${String(h).padStart(2, '0')}:00` })
        }
      }
    }
  }
  return labels
}

function cellClass(dayIdx, hour) {
  const entry = cellRequests.value.get(`${dayIdx}-${hour}`)
  if (!entry) return ''
  return entry.status === 'pending' ? 'tt-pending' : 'tt-approved'
}

function cellTitle(dayIdx, hour) {
  const entry = cellRequests.value.get(`${dayIdx}-${hour}`)
  if (!entry) return ''
  return getOtherName(entry.request)
}

function cellClick(dayIdx, hour) {
  const entry = cellRequests.value.get(`${dayIdx}-${hour}`)
  if (!entry) return
  selectedSlotRequest.value = entry.request
}

function closeDetail() {
  selectedSlotRequest.value = null
}

function openOtherProfile(request) {
  const otherId = props.isTutorAccount ? request.student_id : request.tutor_id
  router.push('/user/' + otherId)
}

function handleDetailCancel() {
  if (!selectedSlotRequest.value) return
  const req = selectedSlotRequest.value
  const masks = req.requested_slots
  const dayIndices = []
  const hourNums = []
  if (Array.isArray(masks)) {
    for (let di = 0; di < masks.length; di++) {
      const mask = masks[di]
      if (typeof mask === 'number' && mask > 0) {
        for (let h = 0; h < 24; h++) {
          if (mask & (1 << h)) {
            if (!dayIndices.includes(di)) dayIndices.push(di)
            hourNums.push(h)
          }
        }
      }
    }
  }
  for (const di of dayIndices) {
    handleCancel(req.id, di, hourNums)
  }
  selectedSlotRequest.value = null
}

function detailSlotLabels() {
  if (!selectedSlotRequest.value?.requested_slots) return []
  return slotLabelsFromMasks(selectedSlotRequest.value.requested_slots)
}

function getDetailOtherName() {
  if (!selectedSlotRequest.value) return ''
  return getOtherName(selectedSlotRequest.value)
}

function getDetailOtherSubject() {
  if (!selectedSlotRequest.value) return ''
  return getOtherSubject(selectedSlotRequest.value)
}

function getOtherProfile(entry) {
  const authId = props.isTutorAccount ? entry.student_id : entry.tutor_id
  return userCache.value[authId] || null
}

function getOtherName(entry) {
  const p = getOtherProfile(entry)
  if (!p) return 'Ładowanie...'
  return p.nickname || [p.name, p.surname].filter(Boolean).join(' ') || 'Nieznany'
}

function getOtherSubject(entry) {
  const p = getOtherProfile(entry)
  return p?.tutor_post?.subject || ''
}

async function fetchLessonRequests() {
  if (!user.value) return
  loadingRequests.value = true
  const column = props.isTutorAccount ? 'tutor_id' : 'student_id'
  const { data, error } = await supabase
    .from('lesson_requests')
    .select('*')
    .eq(column, user.value.id)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Failed to fetch lesson requests:', error)
    lessonRequests.value = []
    loadingRequests.value = false
    return
  }
  lessonRequests.value = (data || []).filter((r) => r.student_id !== r.tutor_id)
  const otherIds = new Set()
  for (const r of lessonRequests.value) {
    otherIds.add(props.isTutorAccount ? r.student_id : r.tutor_id)
  }
  if (otherIds.size > 0) {
    const { data: profiles } = await supabase
      .from('users')
      .select('id, auth_id, nickname, name, surname, profile_picture, tutor_post')
      .in('auth_id', [...otherIds])
    const map = { ...userCache.value }
    for (const p of profiles || []) map[p.auth_id] = p
    userCache.value = map
  }
  loadingRequests.value = false
}

async function handleAccept(entry) {
  const { error } = await supabase
    .from('lesson_requests')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', entry.id)
  if (error) {
    console.error('Failed to accept request:', error)
    return
  }
  const { data: tutorProfile } = await supabase
    .from('users')
    .select('saved_tutors')
    .eq('auth_id', user.value.id)
    .maybeSingle()
  const current = tutorProfile?.saved_tutors || []
  if (!current.includes(entry.student_id)) {
    await supabase
      .from('users')
      .update({ saved_tutors: [...current, entry.student_id] })
      .eq('auth_id', user.value.id)
  }
  entry.status = 'approved'
}

async function handleReject(entry) {
  const { error } = await supabase
    .from('lesson_requests')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', entry.id)
  if (error) {
    console.error('Failed to reject request:', error)
    return
  }
  entry.status = 'rejected'
}

async function handleCancel(lessonId, dayOfWeek, hourNums) {
  if (!lessonId || dayOfWeek == null) return
  const request = lessonRequests.value.find((r) => r.id === lessonId)
  if (!request) return
  const masks = [...(request.requested_slots || [])]
  const bitsToClear = hourNums.reduce((acc, h) => acc | (1 << h), 0)
  masks[dayOfWeek] = (masks[dayOfWeek] || 0) & ~bitsToClear
  const { error } = await supabase
    .from('lesson_requests')
    .update({ requested_slots: masks, updated_at: new Date().toISOString() })
    .eq('id', lessonId)
  if (error) {
    console.error('Failed to cancel lesson:', error)
    return
  }
  request.requested_slots = masks
}

function goToPreviousWeek() {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() - 7)
  currentWeekStart.value = d
}

function goToNextWeek() {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() + 7)
  currentWeekStart.value = d
}

function goToToday() {
  currentWeekStart.value = getMonday(todayDate)
}

watch(
  () => user.value,
  (u) => {
    if (u) fetchLessonRequests()
  },
  { immediate: true },
)

watch(
  () => props.isTutorAccount,
  () => {
    if (user.value) fetchLessonRequests()
  },
)

let realtimeChannel = null

onMounted(() => {
  if (user.value) {
    realtimeChannel = supabase
      .channel('calendar-lesson-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lesson_requests' }, () => {
        if (user.value) fetchLessonRequests()
      })
      .subscribe()
  }
})

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
    realtimeChannel = null
  }
})
</script>

<template>
  <section class="calendar-view-simple">
    <div v-if="!isAuthenticated" class="auth-required-card">
      <h3>Aby korzystać z kalendarza</h3>
      <p>Zarejestruj konto lub zaloguj się, żeby zapisywać i przeglądać swoje lekcje.</p>
      <div class="auth-actions">
        <button class="btn-primary" type="button" @click="openAuthModal('login')">
          Zaloguj się
        </button>
        <button class="btn-secondary" type="button" @click="openAuthModal('signup')">
          Zarejestruj się
        </button>
      </div>
    </div>

    <div v-else class="calendar-card">
      <h2 class="calendar-title">Kalendarz</h2>

      <div class="cal-legend">
        <span class="legend-item"><span class="legend-dot approved-dot"></span> Zaakceptowane</span>
        <span class="legend-item"><span class="legend-dot pending-dot"></span> Oczekujące</span>
      </div>

      <div class="tt-grid-wrap">
        <div class="tt-grid">
          <div class="tt-corner"></div>
          <div v-for="d in dayAbbr" :key="d" class="tt-day-header">{{ d }}</div>
          <template v-for="hour in gridHours" :key="hour">
            <div class="tt-time-label">{{ String(hour).padStart(2, '0') }}:00</div>
            <div
              v-for="(d, di) in dayKeys"
              :key="`${d}-${hour}`"
              class="tt-cell"
              :class="cellClass(di, hour)"
              :title="cellTitle(di, hour)"
              @click="cellClick(di, hour)"
            ></div>
          </template>
        </div>
      </div>

      <div class="cal-divider" />

      <div v-if="selectedSlotRequest" class="modal-overlay" @click.self="closeDetail">
        <div class="modal-card">
          <div class="detail-header">
            <h4 class="detail-title">
              {{ getDetailOtherName() }}
              <span
                v-if="selectedSlotRequest.status === 'approved'"
                class="detail-badge approved-badge"
                >Zaakceptowano</span
              >
              <span
                v-else-if="selectedSlotRequest.status === 'pending'"
                class="detail-badge pending-badge"
                >Oczekuje</span
              >
              <span v-else class="detail-badge rejected-badge">Odrzucono</span>
            </h4>
            <button class="detail-close" type="button" @click="closeDetail">✕</button>
          </div>

          <p v-if="getDetailOtherSubject()" class="detail-subject">{{ getDetailOtherSubject() }}</p>

          <div class="detail-slots">
            <span
              v-for="slot in detailSlotLabels()"
              :key="slot.day + slot.time"
              class="detail-slot-chip"
            >
              {{ slot.day }} {{ slot.time }}
            </span>
          </div>

          <div
            v-if="selectedSlotRequest.status === 'pending' && isTutorAccount"
            class="detail-actions"
          >
            <button class="accept-btn" type="button" @click="handleAccept(selectedSlotRequest)">
              Akceptuj
            </button>
            <button class="reject-btn" type="button" @click="handleReject(selectedSlotRequest)">
              Odrzuć
            </button>
          </div>

          <div v-else-if="selectedSlotRequest.status === 'approved'" class="detail-actions">
            <button
              class="profile-btn"
              type="button"
              @click="openOtherProfile(selectedSlotRequest)"
            >
              Pokaż profil
            </button>
            <button class="cancel-btn" type="button" @click="handleDetailCancel">
              Anuluj lekcję
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.calendar-view-simple {
  width: 100%;
  display: flex;
  justify-content: center;
}

.auth-required-card {
  width: min(100%, 560px);
  padding: 28px;
  border-radius: 24px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
  text-align: center;
  box-sizing: border-box;
}

.auth-required-card h3 {
  margin: 0 0 10px;
  color: var(--text);
  font-size: 22px;
}

.auth-required-card p {
  margin: 0 0 18px;
  color: var(--muted);
  line-height: 1.6;
  font-size: 15px;
}

.auth-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: var(--accent-strong);
  color: white;
}
.btn-secondary {
  background: var(--surface-soft);
  color: var(--text);
  border: 1px solid var(--border);
}

.calendar-card {
  width: 100%;
  background: var(--surface-strong);
  border-radius: 28px;
  padding: 32px 36px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  color: var(--text);
  box-sizing: border-box;
}

.calendar-title {
  margin: 0 0 18px;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text);
}

:root[data-theme='dark'] .calendar-card {
  background: var(--surface-strong);
  border-color: rgba(148, 163, 184, 0.22);
  color: var(--text);
}

.cal-legend {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--muted);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-dot.approved-dot {
  background: #22c55e;
}

.legend-dot.pending-dot {
  background: #f59e0b;
}

.tt-grid-wrap {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: auto;
  max-height: 620px;
}

.tt-grid {
  display: grid;
  grid-template-columns: 50px repeat(7, 1fr);
  grid-template-rows: 28px repeat(24, 32px);
  gap: 2px;
  padding: 4px;
  background: #f3f4f6;
  width: 100%;
}

.tt-corner {
  background: transparent;
}

.tt-day-header {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: #f9fafb;
  border-radius: 3px;
  padding: 2px;
}

.tt-time-label {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  border-radius: 3px;
}

.tt-cell {
  border-radius: 3px;
  background: #fff;
  border: 1px solid #e5e7eb;
  min-width: 0;
  min-height: 0;
  transition: background 0.08s;
}

.tt-cell.tt-pending {
  background: #f59e0b;
  border-color: #f59e0b;
  cursor: pointer;
  opacity: 0.7;
  transition:
    opacity 0.15s,
    transform 0.15s;
}

.tt-cell.tt-pending:hover {
  opacity: 1;
  transform: scale(1.15);
  z-index: 1;
}

.tt-cell.tt-approved {
  background: #22c55e;
  border-color: #22c55e;
  cursor: pointer;
  transition:
    opacity 0.15s,
    transform 0.15s;
}

.tt-cell.tt-approved:hover {
  opacity: 0.85;
  transform: scale(1.15);
  z-index: 1;
}

.cal-divider {
  height: 1px;
  background: var(--border);
  margin: 18px 0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background: var(--surface-strong);
  border-radius: 24px;
  padding: 24px;
  width: min(92vw, 440px);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.2);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.detail-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  text-transform: uppercase;
}

.detail-badge.approved-badge {
  background: #dcfce7;
  color: #166534;
}

.detail-badge.pending-badge {
  background: #fef3c7;
  color: #b45309;
}

.detail-badge.rejected-badge {
  background: #fef2f2;
  color: #b91c1c;
}

.detail-close {
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  flex-shrink: 0;
}

.detail-close:hover {
  background: var(--surface-hover);
}

.detail-subject {
  margin: 0 0 10px;
  color: var(--accent-strong);
  font-weight: 600;
  font-size: 0.9rem;
}

.detail-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 14px;
}

.detail-slot-chip {
  background: var(--primary-color);
  color: white;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
}

.detail-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.accept-btn {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}

.accept-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.reject-btn {
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}

.reject-btn:hover {
  color: #ef4444;
  border-color: #ef4444;
}

.profile-btn {
  background: var(--accent-strong);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}

.profile-btn:hover {
  opacity: 0.85;
}

.cancel-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}

.cancel-btn:hover {
  color: #ef4444;
  border-color: #ef4444;
}

@media (max-width: 760px) {
  .calendar-card {
    padding: 20px;
  }
  .tt-grid-wrap {
    max-height: 340px;
  }
}
</style>
