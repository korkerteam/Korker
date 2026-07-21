<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from '@/composables/useAuth.js'
import { useRouter } from 'vue-router'

const props = defineProps({
  isTutorAccount: { type: Boolean, default: false },
  resetKey: { type: Number, default: 0 },
})

const { isAuthenticated, openAuthModal, user } = useAuth()
const router = useRouter()

const todayDate = new Date()
const lessonRequests = ref([])
const userCache = ref({})
const loadingRequests = ref(false)
const dayKeys = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
const dayAbbr = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']
const gridHours = Array.from({ length: 24 }, (_, i) => i)
const selectedSlot = ref(null)
const showCancelConfirm = ref(false)

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
  selectedSlot.value = { request: entry.request, dayIdx, hour }
}

function closeDetail() {
  selectedSlot.value = null
}

function getOtherName(entry) {
  const authId = props.isTutorAccount ? entry.student_id : entry.tutor_id
  const p = userCache.value[authId]
  if (!p) return 'Ładowanie...'
  return p.nickname || [p.name, p.surname].filter(Boolean).join(' ') || 'Nieznany'
}

function getOtherFullName(entry) {
  const authId = props.isTutorAccount ? entry.student_id : entry.tutor_id
  const p = userCache.value[authId]
  if (!p) return ''
  return [p.name, p.surname].filter(Boolean).join(' ') || ''
}

function getOtherProfile(entry) {
  const authId = props.isTutorAccount ? entry.student_id : entry.tutor_id
  return userCache.value[authId] || null
}

function getOtherSubject(entry) {
  const p = getOtherProfile(entry)
  const tp = p?.tutor_post
  if (!tp) return ''
  const offer = Array.isArray(tp) ? tp[0] || {} : tp
  return offer?.subject || ''
}

function getRequestSlots(entry) {
  return slotLabelsFromMasks(entry.requested_slots)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function acceptSlot() {
  if (!selectedSlot.value) return
  const { request } = selectedSlot.value
  await supabase
    .from('lesson_requests')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', request.id)
  request.status = 'approved'
  await fetchLessonRequests()
}

async function rejectSlot() {
  if (!selectedSlot.value) return
  const { request } = selectedSlot.value
  await supabase
    .from('lesson_requests')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', request.id)
  request.status = 'rejected'
  selectedSlot.value = null
  await fetchLessonRequests()
}

async function cancelApprovedSlot() {
  if (!selectedSlot.value) return
  showCancelConfirm.value = true
}

async function confirmCancelLesson() {
  if (!selectedSlot.value) return
  const { request } = selectedSlot.value
  const { error } = await supabase.from('lesson_requests').delete().eq('id', request.id)
  if (error) {
    console.error('Failed to cancel lesson:', error)
    showCancelConfirm.value = false
    return
  }
  selectedSlot.value = null
  showCancelConfirm.value = false
  await fetchLessonRequests()
}

function dismissCancelConfirm() {
  showCancelConfirm.value = false
}

function openProfile(request) {
  const otherId = props.isTutorAccount ? request.student_id : request.tutor_id
  window.open('/user/' + otherId, '_blank')
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

    <div v-else class="calendar-body">
      <div class="card card-left">
        <h2 class="calendar-title">Kalendarz</h2>
        <div class="cal-legend">
          <span class="legend-item"
            ><span class="legend-dot approved-dot"></span> Zaakceptowane</span
          >
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
                @click="cellClick(di, hour)"
              >
                <span class="tt-cell-name">{{ cellTitle(di, hour) }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="card card-right">
        <template v-if="selectedSlot">
          <div class="detail-panel-header">
            <h3 class="detail-panel-title">Szczegóły</h3>
            <button class="detail-close" type="button" @click="closeDetail">✕</button>
          </div>

          <div class="detail-person">
            <img
              v-if="getOtherProfile(selectedSlot.request)?.profile_picture"
              :src="getOtherProfile(selectedSlot.request).profile_picture"
              class="detail-avatar"
            />
            <div v-else class="detail-avatar detail-avatar-placeholder">
              {{ (getOtherName(selectedSlot.request) || '?')[0] }}
            </div>
            <div class="detail-person-info">
              <span class="detail-name">{{ getOtherName(selectedSlot.request) }}</span>
              <span v-if="getOtherFullName(selectedSlot.request)" class="detail-fullname">
                {{ getOtherFullName(selectedSlot.request) }}
              </span>
            </div>
          </div>

          <span
            class="detail-badge"
            :class="selectedSlot.request.status === 'approved' ? 'badge-approved' : 'badge-pending'"
          >
            {{ selectedSlot.request.status === 'approved' ? 'Zaakceptowano' : 'Oczekuje' }}
          </span>

          <div class="detail-section">
            <div class="detail-section-title">Godziny</div>
            <div class="detail-slots">
              <span
                v-for="(s, i) in getRequestSlots(selectedSlot.request)"
                :key="i"
                class="detail-slot-chip"
              >
                {{ s.day }}, {{ s.time }}
              </span>
            </div>
          </div>

          <div v-if="getOtherSubject(selectedSlot.request)" class="detail-section">
            <div class="detail-section-title">Przedmiot</div>
            <p class="detail-subject">{{ getOtherSubject(selectedSlot.request) }}</p>
          </div>

          <div class="detail-section">
            <div class="detail-section-title">Informacje</div>
            <p class="detail-meta">Utworzono: {{ formatDate(selectedSlot.request.created_at) }}</p>
          </div>

          <div class="detail-actions">
            <template v-if="selectedSlot.request.status === 'pending' && isTutorAccount">
              <button class="action-btn action-accept" type="button" @click="acceptSlot()">
                Akceptuj
              </button>
              <button class="action-btn action-reject" type="button" @click="rejectSlot()">
                Odrzuć
              </button>
            </template>
            <template v-else-if="selectedSlot.request.status === 'approved'">
              <button
                class="action-btn action-profile"
                type="button"
                @click="openProfile(selectedSlot.request)"
              >
                Pokaż profil
              </button>
              <button class="action-btn action-cancel" type="button" @click="cancelApprovedSlot()">
                Anuluj lekcję
              </button>
            </template>
          </div>
        </template>

        <template v-else>
          <div class="detail-panel-header">
            <h3 class="detail-panel-title">Szczegóły</h3>
          </div>
          <p class="detail-empty-text">Kliknij wizytę w kalendarzu, aby zobaczyć szczegóły.</p>
        </template>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showCancelConfirm"
        class="cancel-confirm-backdrop"
        @click.self="dismissCancelConfirm"
      >
        <div class="cancel-confirm-card">
          <h3 class="cancel-confirm-title">Anuluj lekcję</h3>
          <p class="cancel-confirm-text">
            Na pewno chcesz anulować tę lekcję? Tej operacji nie można cofnąć.
          </p>
          <div class="cancel-confirm-actions">
            <button
              class="cancel-confirm-btn cancel-confirm-keep"
              type="button"
              @click="dismissCancelConfirm"
            >
              Zostaw
            </button>
            <button
              class="cancel-confirm-btn cancel-confirm-do"
              type="button"
              @click="confirmCancelLesson"
            >
              Anuluj lekcję
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.calendar-view-simple {
  width: 100%;
  --s: 1.15;
}

.auth-required-card {
  width: min(100%, calc(560px * var(--s)));
  padding: calc(28px * var(--s));
  border-radius: calc(24px * var(--s));
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
  text-align: center;
  box-sizing: border-box;
}

.auth-required-card h3 {
  margin: 0 0 calc(10px * var(--s));
  color: var(--text);
  font-size: calc(22px * var(--s));
}
.auth-required-card p {
  margin: 0 0 calc(18px * var(--s));
  color: var(--muted);
  line-height: 1.6;
  font-size: calc(15px * var(--s));
}
.auth-actions {
  display: flex;
  justify-content: center;
  gap: calc(12px * var(--s));
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 999px;
  padding: calc(10px * var(--s)) calc(16px * var(--s));
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

.card {
  background: var(--surface-strong);
  border-radius: calc(24px * var(--s));
  padding: calc(20px * var(--s));
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  color: var(--text);
  box-sizing: border-box;
}

:root[data-theme='dark'] .card {
  background: var(--surface-strong);
  border-color: rgba(148, 163, 184, 0.22);
}

.card-left {
  width: calc(520px * var(--s));
  flex: none;
}

.card-right {
  width: calc(320px * var(--s));
  flex: none;
  display: flex;
  flex-direction: column;
  gap: calc(14px * var(--s));
  align-self: flex-start;
  position: sticky;
  top: calc(20px * var(--s));
}

.calendar-title {
  margin: 0 0 calc(12px * var(--s));
  font-size: calc(1.2rem * var(--s));
  font-weight: 800;
}

.cal-legend {
  display: flex;
  gap: calc(12px * var(--s));
  margin-bottom: calc(10px * var(--s));
  font-size: calc(11px * var(--s));
  color: var(--muted);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: calc(6px * var(--s));
}
.legend-dot {
  width: calc(12px * var(--s));
  height: calc(12px * var(--s));
  border-radius: 3px;
  flex-shrink: 0;
}
.legend-dot.approved-dot {
  background: #22c55e;
}
.legend-dot.pending-dot {
  background: #f59e0b;
}

.calendar-body {
  display: flex;
  justify-content: center;
  gap: calc(16px * var(--s));
}

.tt-grid-wrap {
  flex: 1;
  min-width: 0;
  border: 1px solid #e5e7eb;
  border-radius: calc(10px * var(--s));
  overflow: hidden;
}

.tt-grid {
  display: grid;
  grid-template-columns: calc(36px * var(--s)) repeat(7, 1fr);
  grid-template-rows: calc(22px * var(--s)) repeat(24, calc(20px * var(--s)));
  gap: 1px;
  padding: 3px;
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
  font-size: calc(9px * var(--s));
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  background: #f9fafb;
  border-radius: 2px;
  padding: 1px;
}

.tt-time-label {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(8px * var(--s));
  font-weight: 600;
  color: #9ca3af;
  border-radius: 2px;
}

.tt-cell {
  border-radius: 3px;
  background: #fff;
  border: 1px solid #e5e7eb;
  min-width: 0;
  min-height: 0;
  transition: background 0.08s;
  position: relative;
  overflow: hidden;
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
  transform: scale(1.1);
  z-index: 2;
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
  transform: scale(1.1);
  z-index: 2;
}

.tt-cell-name {
  display: block;
  font-size: calc(8px * var(--s));
  font-weight: 700;
  color: #fff;
  text-align: center;
  line-height: calc(18px * var(--s));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 2px;
  pointer-events: none;
}

.detail-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-panel-title {
  margin: 0;
  font-size: calc(1rem * var(--s));
  font-weight: 800;
}

.detail-empty-text {
  margin: 0;
  font-size: calc(0.85rem * var(--s));
  color: var(--muted);
  line-height: 1.5;
}

.detail-close {
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: calc(1.1rem * var(--s));
  cursor: pointer;
  padding: 2px calc(6px * var(--s));
  border-radius: calc(6px * var(--s));
}

.detail-close:hover {
  background: var(--surface-hover);
}

.detail-person {
  display: flex;
  align-items: center;
  gap: calc(12px * var(--s));
}

.detail-avatar {
  width: calc(44px * var(--s));
  height: calc(44px * var(--s));
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--surface);
}

.detail-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(1.1rem * var(--s));
  font-weight: 800;
  color: var(--muted);
}

.detail-person-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.detail-name {
  font-size: calc(0.95rem * var(--s));
  font-weight: 700;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-fullname {
  font-size: calc(0.75rem * var(--s));
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-badge {
  font-size: calc(0.65rem * var(--s));
  font-weight: 700;
  padding: 3px calc(8px * var(--s));
  border-radius: 999px;
  text-transform: uppercase;
  align-self: flex-start;
}

.detail-badge.badge-approved {
  background: #dcfce7;
  color: #166534;
}
.detail-badge.badge-pending {
  background: #fef3c7;
  color: #b45309;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: calc(6px * var(--s));
}

.detail-section-title {
  font-size: calc(0.7rem * var(--s));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.detail-slots {
  display: flex;
  flex-wrap: wrap;
  gap: calc(4px * var(--s));
}

.detail-slot-chip {
  padding: calc(4px * var(--s)) calc(8px * var(--s));
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: calc(6px * var(--s));
  font-size: calc(0.75rem * var(--s));
  font-weight: 600;
  color: var(--text);
}

.detail-subject {
  margin: 0;
  font-size: calc(0.85rem * var(--s));
  font-weight: 600;
  color: var(--text);
  padding: calc(8px * var(--s)) calc(10px * var(--s));
  background: var(--surface-strong);
  border-radius: calc(8px * var(--s));
}

.detail-meta {
  margin: 0;
  font-size: calc(0.75rem * var(--s));
  color: var(--muted);
}

.detail-actions {
  display: flex;
  gap: calc(8px * var(--s));
  flex-wrap: wrap;
  margin-top: calc(4px * var(--s));
}

.action-btn {
  border: none;
  border-radius: calc(10px * var(--s));
  padding: calc(10px * var(--s)) calc(18px * var(--s));
  font-weight: 700;
  font-size: calc(0.85rem * var(--s));
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.action-accept {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}
.action-accept:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.action-reject {
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
}
.action-reject:hover {
  color: #ef4444;
  border-color: #ef4444;
}

.action-profile {
  background: var(--accent-strong);
  color: white;
}
.action-profile:hover {
  opacity: 0.85;
}

.action-cancel {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
}
.action-cancel:hover {
  color: #ef4444;
  border-color: #ef4444;
}

@media (max-width: 820px) {
  .calendar-body {
    flex-direction: column;
  }
  .card-right {
    width: 100%;
    position: static;
  }
}
</style>

<style>
.cancel-confirm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.cancel-confirm-card {
  width: min(90vw, 380px);
  padding: 28px 24px 24px;
  background: var(--surface-strong);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  text-align: center;
}

.cancel-confirm-title {
  margin: 0 0 10px;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text);
}

.cancel-confirm-text {
  margin: 0 0 22px;
  font-size: 0.9rem;
  color: var(--muted);
  line-height: 1.5;
}

.cancel-confirm-actions {
  display: flex;
  gap: 10px;
}

.cancel-confirm-btn {
  flex: 1;
  border: none;
  border-radius: 12px;
  padding: 11px 16px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.cancel-confirm-keep {
  background: var(--surface-soft);
  color: var(--text);
  border: 1px solid var(--border);
}

.cancel-confirm-keep:hover {
  background: var(--surface-hover);
}

.cancel-confirm-do {
  background: #ef4444;
  color: white;
}

.cancel-confirm-do:hover {
  background: #dc2626;
}
</style>
