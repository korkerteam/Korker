<script setup>
import { ref, computed, inject, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase.js'
import LoadingBox from '@/components/LoadingBox.vue'
import { useAuth } from '@/composables/useAuth.js'
import { sendEmailNotification, buildLessonRequestEmailHtml } from '@/services/emailService.js'

const emit = defineEmits(['show-teacher', 'remove-teacher'])
const props = defineProps({
  teachers: {
    type: Array,
    default: () => [],
  },
  isTutorAccount: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const selectedTeacher = ref(null)
const { isAuthenticated, openAuthModal, user } = useAuth()
const { openChatWithUser } = inject('globalChat')

const showTimetable = ref(false)
const timetableData = ref(null)
const timetableLoading = ref(false)
const timetableError = ref('')
const selectedSlots = ref(new Set())
const requestedSlots = ref(new Set())
const busySlots = ref(new Set())
const submitting = ref(false)
const deleting = ref(null)
const feedbackMessage = ref('')
const dayKeys = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
const dayAbbr = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']
const gridHours = Array.from({ length: 24 }, (_, i) => i)

function slotLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00-${String((hour + 1) % 24).padStart(2, '0')}:00`
}

function slotKey(day, hour) {
  return `${day}-${hour}`
}

function hasSlot(day, hour) {
  return timetableData.value?.[day]?.includes(slotLabel(hour))
}

function isSelected(day, hour) {
  return selectedSlots.value.has(slotKey(day, hour))
}

function isRequested(day, hour) {
  return requestedSlots.value.has(slotKey(day, hour))
}

function isBusy(day, hour) {
  return busySlots.value.has(slotKey(day, hour))
}

function toggleSlot(day, hour) {
  if (!hasSlot(day, hour) || isRequested(day, hour) || isBusy(day, hour)) return
  const key = slotKey(day, hour)
  const next = new Set(selectedSlots.value)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }
  selectedSlots.value = next
}

function getTeacherIdentifier(teacher) {
  return teacher.nickname || teacher.auth_id || teacher.id
}

async function openTimetable(teacher) {
  selectedTeacher.value = teacher
  showTimetable.value = true
  timetableLoading.value = true
  router.replace({ query: { panel: 'teachers', plan: getTeacherIdentifier(teacher) } })
  timetableError.value = ''
  timetableData.value = null
  selectedSlots.value = new Set()
  requestedSlots.value = new Set()

  const tutorId = teacher.auth_id || teacher.id

  const [tutorResult, requestsResult, busyResult] = await Promise.all([
    supabase.from('users').select('tutor_post').eq('id', teacher.id).maybeSingle(),
    user.value
      ? supabase
          .from('lesson_requests')
          .select('requested_slots')
          .eq('student_id', user.value.id)
          .eq('tutor_id', tutorId)
          .in('status', ['pending', 'approved'])
      : Promise.resolve({ data: [] }),
    supabase
      .from('lesson_requests')
      .select('requested_slots')
      .eq('tutor_id', tutorId)
      .eq('status', 'approved'),
  ])

  if (tutorResult.error) {
    timetableError.value = 'Nie udało się załadować planu zajęć.'
  } else if (tutorResult.data?.tutor_post) {
    const raw = tutorResult.data.tutor_post
    const first = Array.isArray(raw) ? raw[0] || {} : raw
    timetableData.value = first.weeklyAvailability || null
  } else {
    timetableData.value = null
  }

  if (requestsResult.data) {
    const requested = new Set()
    for (const req of requestsResult.data) {
      const masks = req.requested_slots
      if (Array.isArray(masks)) {
        for (let dayIdx = 0; dayIdx < masks.length; dayIdx++) {
          const mask = masks[dayIdx]
          if (typeof mask === 'number' && mask > 0) {
            for (let h = 0; h < 24; h++) {
              if (mask & (1 << h)) {
                requested.add(slotKey(dayKeys[dayIdx], h))
              }
            }
          }
        }
      }
    }
    requestedSlots.value = requested
  }

  if (busyResult.data) {
    const busy = new Set()
    for (const req of busyResult.data) {
      const masks = req.requested_slots
      if (Array.isArray(masks)) {
        for (let dayIdx = 0; dayIdx < masks.length; dayIdx++) {
          const mask = masks[dayIdx]
          if (typeof mask === 'number' && mask > 0) {
            for (let h = 0; h < 24; h++) {
              if (mask & (1 << h)) {
                busy.add(slotKey(dayKeys[dayIdx], h))
              }
            }
          }
        }
      }
    }
    busySlots.value = busy
  }

  timetableLoading.value = false
}

function closeTimetable() {
  showTimetable.value = false
  selectedTeacher.value = null
  timetableData.value = null
  timetableLoading.value = false
  timetableError.value = ''
  selectedSlots.value = new Set()
  requestedSlots.value = new Set()
  busySlots.value = new Set()
  feedbackMessage.value = ''
  router.replace({ query: { panel: 'teachers' } })
}

async function submitLessonRequest() {
  if (!user.value) {
    feedbackMessage.value = 'Musisz być zalogowany, aby umówić lekcję.'
    return
  }
  if (selectedSlots.value.size === 0) {
    feedbackMessage.value = 'Wybierz przynajmniej jeden termin z planu zajęć.'
    return
  }
  submitting.value = true
  feedbackMessage.value = ''

  const { data: existingRequests } = await supabase
    .from('lesson_requests')
    .select('requested_slots')
    .eq('student_id', user.value.id)
    .in('status', ['pending', 'approved'])

  if (existingRequests?.length) {
    const bookedSlots = new Set()
    for (const req of existingRequests) {
      const masks = req.requested_slots
      if (Array.isArray(masks)) {
        for (let dayIdx = 0; dayIdx < masks.length; dayIdx++) {
          const mask = masks[dayIdx]
          if (typeof mask === 'number' && mask > 0) {
            for (let h = 0; h < 24; h++) {
              if (mask & (1 << h)) {
                bookedSlots.add(slotKey(dayKeys[dayIdx], h))
              }
            }
          }
        }
      }
    }
    for (const key of selectedSlots.value) {
      if (bookedSlots.has(key)) {
        const dashIdx = key.lastIndexOf('-')
        const day = key.slice(0, dashIdx)
        const hour = key.slice(dashIdx + 1)
        feedbackMessage.value = `Masz już zaplanowaną lekcję w ${day} o ${hour}:00. Wybierz inny termin.`
        submitting.value = false
        return
      }
    }
  }

  const masks = dayKeys.map(() => 0)
  for (const key of selectedSlots.value) {
    const dashIdx = key.lastIndexOf('-')
    const day = key.slice(0, dashIdx)
    const hour = parseInt(key.slice(dashIdx + 1), 10)
    const dayIdx = dayKeys.indexOf(day)
    if (dayIdx !== -1) {
      masks[dayIdx] |= 1 << hour
    }
  }

  const { error } = await supabase.from('lesson_requests').insert({
    student_id: user.value.id,
    tutor_id: selectedTeacher.value.auth_id || selectedTeacher.value.id,
    requested_slots: masks,
    status: 'pending',
  })

  submitting.value = false
  if (error) {
    feedbackMessage.value = 'Nie udało się wysłać prośby. Spróbuj ponownie.'
  } else {
    feedbackMessage.value = 'Prośba o lekcje została wysłana!'
    const sentSlots = [...selectedSlots.value]
    for (const key of sentSlots) {
      requestedSlots.value.add(key)
    }
    selectedSlots.value = new Set()

    const tutorId = selectedTeacher.value.auth_id || selectedTeacher.value.id
    const { data: tutorEmail } = await supabase.rpc('get_user_email', { target_id: tutorId })
    if (tutorEmail) {
      const slotStr = sentSlots
        .map((key) => {
          const dashIdx = key.lastIndexOf('-')
          const day = key.slice(0, dashIdx)
          const hour = key.slice(dashIdx + 1)
          return `${day} ${hour}:00`
        })
        .slice(0, 2)
        .join(', ')
      sendEmailNotification(
        tutorEmail,
        'Nowa prośba o lekcję — Korker',
        buildLessonRequestEmailHtml(user.value?.email || 'Student', slotStr),
      )
    }
  }
}

watch(
  () => [props.teachers, route.query.plan],
  ([teachers, planId]) => {
    if (planId && teachers?.length) {
      const teacher = teachers.find((t) => getTeacherIdentifier(t) === planId)
      if (teacher && !showTimetable.value) {
        openTimetable(teacher)
      }
    }
  },
  { immediate: true },
)

function getDisplayName(teacher, nameOrNickname = 'name') {
  if (nameOrNickname === 'nickname' && teacher.nickname) {
    return teacher.nickname
  } else {
    const fullName = [teacher.name, teacher.surname].filter(Boolean).join(' ')
    return fullName || teacher.name
  }
}

const teacherImageMap = {
  'Anna Kowalska':
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'Piotr Nowak':
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  'Marta Wiśniewska':
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
  'Jakub Zieliński':
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  'Katarzyna Sobczak':
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
  'Maciej Płaczek':
    'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=800&q=80',
  'Natalia Wójcik':
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'Oliwier Kaczmarek':
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  'Patrycja Marek':
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
}

const isMany = computed(() => (props.teachers || []).length > 5)

function getTeacherImage(teacher) {
  return teacher?.profile_picture || teacherImageMap[teacher?.name] || ''
}

function getFirstOffer(teacher) {
  const tp = teacher?.tutor_post
  if (!tp) return null
  return Array.isArray(tp) ? tp[0] || null : tp
}

function getTeacherSubject(teacher) {
  const offer = getFirstOffer(teacher)
  return offer?.subject || ''
}

function getTeacherLevel(teacher) {
  const offer = getFirstOffer(teacher)
  return offer?.level || ''
}

function onShow(teacher) {
  const identifier = teacher.nickname || teacher.auth_id
  if (identifier) {
    router.push('/user/' + identifier)
  }
}

let removeTimer = null

function onRemove(teacher) {
  const pid = teacher.auth_id || teacher.id
  if (!pid || deleting.value) return
  deleting.value = pid
  clearTimeout(removeTimer)
  removeTimer = setTimeout(() => {
    emit('remove-teacher', teacher)
    selectedTeacher.value = null
    deleting.value = null
  }, 600)
}

function goBack() {
  selectedTeacher.value = null
}

function openChat(teacher) {
  if (!teacher) return
  openChatWithUser(teacher.auth_id || teacher.id)
}
</script>

<template>
  <LoadingBox v-if="loading" />
  <div
    v-else
    class="teacher-panel"
    :class="{
      compact: isMany && !showTimetable,
      'guest-state': !isAuthenticated,
      'plan-full': showTimetable,
    }"
  >
    <div v-if="!isAuthenticated" class="auth-required-card">
      <h3>Aby zobaczyć swoich nauczycieli</h3>
      <p>
        Zarejestruj konto lub zaloguj się, żeby przeglądać swoją listę nauczycieli i zarządzać nią.
      </p>
      <div class="auth-actions">
        <button class="btn-primary" type="button" @click="openAuthModal('login')">
          Zaloguj się
        </button>
        <button class="btn-secondary" type="button" @click="openAuthModal('signup')">
          Zarejestruj się
        </button>
      </div>
    </div>

    <!-- Teacher List View -->
    <template v-else-if="!selectedTeacher">
      <div class="teacher-header">
        <div>
          <h3>{{ props.isTutorAccount ? 'Moi Studenci' : 'Moi Nauczyciele' }}</h3>
        </div>
      </div>

      <div class="teacher-card-list">
        <template v-if="teachers.length">
          <div v-for="teacher in teachers" :key="teacher.id || teacher.name" class="teacher-row">
            <div class="avatar">
              <img
                v-if="getTeacherImage(teacher)"
                :src="getTeacherImage(teacher)"
                :alt="getDisplayName(teacher)"
              />
              <span v-else>{{ getDisplayName(teacher).charAt(0) }}</span>
            </div>
            <div class="meta">
              <div v-if="teacher.nickname">
                <div class="name">{{ getDisplayName(teacher, 'name') }}</div>
                <div class="nickname-name">{{ getDisplayName(teacher, 'nickname') }}</div>
              </div>
              <div v-else class="name">{{ getDisplayName(teacher, 'name') }}</div>
              <div class="details">
                {{ getTeacherSubject(teacher)
                }}<span v-if="getTeacherLevel(teacher)"> • {{ getTeacherLevel(teacher) }}</span>
              </div>
            </div>
            <div class="actions">
              <button class="btn small" @click="onShow(teacher)">Pokaż</button>
              <button class="btn small" @click.stop="openChat(teacher)">Napisz</button>
              <button
                v-if="!props.isTutorAccount"
                class="btn small accent"
                @click="openTimetable(teacher)"
              >
                Plan
              </button>
              <button
                class="btn small ghost dziendobry"
                :disabled="deleting === (teacher.auth_id || teacher.id)"
                @click="onRemove(teacher)"
              >
                <span
                  v-if="deleting === (teacher.auth_id || teacher.id)"
                  class="del-spinner"
                ></span>
                <span v-else>Usuń</span>
              </button>
            </div>
          </div>
        </template>
        <p v-else class="empty-state">
          {{
            props.isTutorAccount
              ? 'Nie masz jeszcze żadnych studentów.'
              : 'Wybierz nauczycieli korzystając z funkcji "Szukaj korepetycji"'
          }}
        </p>
      </div>
    </template>

    <!-- Teacher Profile View -->
    <template v-else-if="selectedTeacher && !showTimetable">
      <div class="profile-header">
        <button class="back-button" @click="goBack">← Wróć</button>
      </div>

      <div class="profile-content">
        <div class="profile-image">
          <img
            v-if="getTeacherImage(selectedTeacher)"
            :src="getTeacherImage(selectedTeacher)"
            :alt="getDisplayName(selectedTeacher)"
          />
          <div v-else class="image-placeholder">
            {{ getDisplayName(selectedTeacher).charAt(0) }}
          </div>
        </div>

        <div class="profile-info">
          <h2 class="profile-name">{{ getDisplayName(selectedTeacher) }}</h2>
          <p class="profile-meta">
            {{ getTeacherSubject(selectedTeacher)
            }}<span v-if="getTeacherLevel(selectedTeacher)">
              • {{ getTeacherLevel(selectedTeacher) }}</span
            >
          </p>

          <div class="bio-section">
            <p class="profile-bio">{{ selectedTeacher.bio }}</p>
          </div>

          <div v-if="selectedTeacher.tags" class="tags-section">
            <div class="tags-label">Specjalizacje:</div>
            <div class="tags-grid">
              <span v-for="tag in selectedTeacher.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>

          <button
            class="remove-button"
            :disabled="deleting === (selectedTeacher.auth_id || selectedTeacher.id)"
            @click="onRemove(selectedTeacher)"
          >
            <span
              v-if="deleting === (selectedTeacher.auth_id || selectedTeacher.id)"
              class="del-spinner"
            ></span>
            <span v-else>Usuń z listy</span>
          </button>
        </div>
      </div>
    </template>

    <!-- Timetable Page View (Plan) -->
    <template v-else-if="selectedTeacher && showTimetable">
      <div class="profile-header">
        <button class="back-button" @click="closeTimetable">← Wróć</button>
      </div>

      <div class="plan-layout">
        <div class="plan-sidebar">
          <div class="plan-avatar">
            <img
              v-if="getTeacherImage(selectedTeacher)"
              :src="getTeacherImage(selectedTeacher)"
              :alt="getDisplayName(selectedTeacher)"
            />
            <span v-else>{{ getDisplayName(selectedTeacher).charAt(0) }}</span>
          </div>
          <h2 class="plan-name">{{ getDisplayName(selectedTeacher) }}</h2>
          <p class="plan-meta">
            {{ getTeacherSubject(selectedTeacher)
            }}<span v-if="getTeacherLevel(selectedTeacher)">
              • {{ getTeacherLevel(selectedTeacher) }}</span
            >
          </p>

          <button class="plan-action-button" :disabled="submitting" @click="submitLessonRequest">
            {{ submitting ? 'Wysyłanie...' : 'Umów lekcję' }}
          </button>
          <p
            v-if="feedbackMessage"
            class="plan-feedback"
            :class="{
              success:
                !feedbackMessage.includes('Nie udało') &&
                !feedbackMessage.includes('Musisz') &&
                !feedbackMessage.includes('Wybierz'),
            }"
          >
            {{ feedbackMessage }}
          </p>
        </div>

        <div class="plan-main">
          <h3 class="plan-section-title">Plan zajęć</h3>

          <div class="plan-legend">
            <span class="legend-item"><span class="legend-dot available-dot"></span> Dostępne</span>
            <span class="legend-item"><span class="legend-dot selected-dot"></span> Wybrane</span>
            <span class="legend-item"
              ><span class="legend-dot requested-dot"></span> Zarezerwowane</span
            >
            <span class="legend-item"><span class="legend-dot busy-dot"></span> Zajęte</span>
          </div>

          <LoadingBox v-if="timetableLoading" />
          <p v-if="timetableError" class="timetable-error">{{ timetableError }}</p>
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
                  :class="{
                    available: hasSlot(d, hour) && !isRequested(d, hour) && !isBusy(d, hour),
                    selected: isSelected(d, hour),
                    requested: isRequested(d, hour) && !isBusy(d, hour),
                    busy: isBusy(d, hour),
                  }"
                  @click="toggleSlot(d, hour)"
                ></div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.teacher-panel {
  width: 100%;
  max-width: 1100px;
  background: var(--surface-strong);
  border-radius: 16px;
  padding: 0;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  font-family: Inter, system-ui, sans-serif;
  min-height: 0;
  max-height: calc(100vh - 180px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
}

.teacher-panel.compact {
  max-height: 75vh;
}

.teacher-panel.plan-full {
  max-height: none;
  overflow: visible;
}

.teacher-panel.guest-state {
  background: transparent;
  border: none;
  box-shadow: none;
  max-height: none;
  overflow: visible;
}

.auth-required-card {
  width: min(100%, 520px);
  padding: 28px;
  border-radius: 24px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
  text-align: center;
  box-sizing: border-box;
  margin: 24px auto;
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

.teacher-header h3 {
  margin: 0;
  font-size: 20px;
  color: var(--text);
}
.teacher-header .sub {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.teacher-header {
  padding: 18px;
  border-bottom: 1px solid var(--border);
}

.teacher-card-list {
  margin-top: 0;
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}

.teacher-card-list::-webkit-scrollbar {
  width: 10px;
}
.teacher-card-list::-webkit-scrollbar-thumb {
  background: rgba(16, 32, 54, 0.2);
  border-radius: 8px;
}
.teacher-card-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(16, 32, 54, 0.2) transparent;
}

.teacher-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  margin-bottom: 8px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.meta .name {
  font-weight: 700;
  color: var(--text);
  font-size: 1rem;
  margin-bottom: 1px;
}

.meta .nickname-name {
  font-weight: 400;
  color: var(--text);
  font-size: 0.8rem;
}
.meta .details {
  font-size: 13px;
  color: var(--muted);
  margin-top: 4px;
}

.actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn.small {
  font-size: 13px;
}
.btn.ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}
.btn.ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn.accent {
  background: var(--accent-strong);
  color: white;
  border: none;
}
.btn.accent:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(79, 117, 199, 0.3);
}

.empty-state {
  color: var(--muted);
  padding: 24px;
  text-align: center;
}

.profile-header {
  padding: 12px 18px;
  border-bottom: 1px solid var(--border);
  border-top: 1px solid var(--border);
}

.back-button {
  background: transparent;
  border: none;
  color: var(--accent-strong);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 0;
  transition: all 0.2s ease;
}

.back-button:hover {
  color: var(--accent);
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 24px 32px;
  overflow-y: auto;
  flex: 1;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 42px;
  overflow: hidden;
  flex-shrink: 0;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 400px;
}

.profile-name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
}

.profile-meta {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  font-weight: 500;
}

.bio-section {
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  width: 100%;
}

.profile-bio {
  margin: 0;
  line-height: 1.6;
  color: var(--text);
  font-size: 14px;
}

.tags-section {
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  width: 100%;
}

.tags-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  display: inline-block;
  background: var(--accent-soft);
  color: var(--text);
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--border);
}

.remove-button {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 6px;
}

.remove-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
}

.remove-button:active {
  transform: translateY(0);
}

.remove-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.plan-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  padding: 24px 32px;
}

.plan-sidebar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.plan-avatar {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 42px;
  overflow: hidden;
  flex-shrink: 0;
}

.plan-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.plan-avatar span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.plan-name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.plan-meta {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  font-weight: 500;
  margin-top: 2px;
}

.plan-action-button {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 6px;
  width: 100%;
}

.plan-action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.plan-feedback {
  margin: 8px 0 0;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: #fef2f2;
  color: #b91c1c;
  width: 100%;
  box-sizing: border-box;
}

.plan-feedback.success {
  background: #f0fdf4;
  color: #15803d;
}

.plan-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.plan-section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.plan-legend {
  display: flex;
  gap: 8px;
  font-size: 13px;
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

.legend-dot.available-dot {
  background: #4f75c7;
}

.legend-dot.selected-dot {
  background: #22c55e;
}

.legend-dot.requested-dot {
  background: #f59e0b;
}

.legend-dot.busy-dot {
  background: #ef4444;
}

.tt-grid-wrap {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.tt-grid {
  display: grid;
  grid-template-columns: 44px repeat(7, 1fr);
  grid-template-rows: 24px repeat(24, 22px);
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
  font-size: 9px;
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
  font-size: 9px;
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

.tt-cell.available {
  background: #4f75c7;
  border-color: var(--accent);
  cursor: pointer;
}

.tt-cell.selected {
  background: #22c55e;
  border-color: #22c55e;
  cursor: pointer;
}

.tt-cell.requested {
  background: #f59e0b;
  border-color: #f59e0b;
  cursor: not-allowed;
  opacity: 0.7;
}

.tt-cell.busy {
  background: #ef4444;
  border-color: #ef4444;
  cursor: not-allowed;
  opacity: 0.7;
}

.timetable-error {
  color: #ef4444;
  font-weight: 600;
  text-align: center;
}

.del-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: delSpin 0.6s linear infinite;
  vertical-align: middle;
}

@keyframes delSpin {
  to {
    transform: rotate(360deg);
  }
}

.dziendobry {
  width: 55px;
}
</style>
