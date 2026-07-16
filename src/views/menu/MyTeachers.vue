<script setup>
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase.js'
import LoadingBox from '@/components/LoadingBox.vue'
import { useAuth } from '@/composables/useAuth.js'

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

const loading = ref(false)
const selectedTeacher = ref(null)
const { isAuthenticated, openAuthModal } = useAuth()

const showTimetable = ref(false)
const timetableData = ref(null)
const timetableLoading = ref(false)
const timetableError = ref('')
const dayKeys = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
const dayAbbr = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']
const gridHours = Array.from({ length: 14 }, (_, i) => i + 8)

function slotLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00-${String((hour + 1) % 24).padStart(2, '0')}:00`
}

function hasSlot(day, hour) {
  return timetableData.value?.[day]?.includes(slotLabel(hour))
}

async function openTimetable(teacher) {
  showTimetable.value = true
  timetableLoading.value = true
  timetableError.value = ''
  timetableData.value = null

  const { data, error } = await supabase
    .from('users')
    .select('tutor_post')
    .eq('id', teacher.id)
    .maybeSingle()

  if (error) {
    timetableError.value = 'Nie udało się załadować planu zajęć.'
  } else if (data?.tutor_post?.weeklyAvailability) {
    timetableData.value = data.tutor_post.weeklyAvailability
  } else {
    timetableData.value = null
  }
  timetableLoading.value = false
}

function closeTimetable() {
  showTimetable.value = false
  timetableData.value = null
  timetableLoading.value = false
  timetableError.value = ''
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
  return teacher?.image || teacherImageMap[teacher?.name] || ''
}

function onShow(teacher) {
  selectedTeacher.value = teacher
}

function onRemove(teacher) {
  emit('remove-teacher', teacher)
  selectedTeacher.value = null
}

function goBack() {
  selectedTeacher.value = null
}
</script>

<template>
  <LoadingBox v-if="loading" />
  <div v-else class="teacher-panel" :class="{ compact: isMany, 'guest-state': !isAuthenticated }">
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
                :alt="teacher.name"
              />
              <span v-else>{{ teacher.name.charAt(0) }}</span>
            </div>
            <div class="meta">
              <div class="name">{{ teacher.name }}</div>
              <div class="details">{{ teacher.subject }} • {{ teacher.level }}</div>
            </div>
            <div class="actions">
              <button class="btn small" @click="onShow(teacher)">Pokaż</button>
              <button class="btn small accent" @click="openTimetable(teacher)">Plan</button>
              <button class="btn small ghost" @click="onRemove(teacher)">Usuń</button>
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
    <template v-else>
      <div class="profile-header">
        <button class="back-button" @click="goBack">← Wróć</button>
      </div>

      <div class="profile-content">
        <div class="profile-image">
          <img
            v-if="getTeacherImage(selectedTeacher)"
            :src="getTeacherImage(selectedTeacher)"
            :alt="selectedTeacher.name"
          />
          <div v-else class="image-placeholder">{{ selectedTeacher.name.charAt(0) }}</div>
        </div>

        <div class="profile-info">
          <h2 class="profile-name">{{ selectedTeacher.name }}</h2>
          <p class="profile-meta">{{ selectedTeacher.subject }} • {{ selectedTeacher.level }}</p>

          <div class="bio-section">
            <p class="profile-bio">{{ selectedTeacher.bio }}</p>
          </div>

          <div v-if="selectedTeacher.tags" class="tags-section">
            <div class="tags-label">Specjalizacje:</div>
            <div class="tags-grid">
              <span v-for="tag in selectedTeacher.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>

          <button class="remove-button" @click="onRemove(selectedTeacher)">Usuń z listy</button>
        </div>
      </div>
    </template>

    <!-- Timetable Modal (inside root to preserve single-root Transition) -->
    <Teleport to="body">
      <div v-if="showTimetable" class="timetable-overlay" @click.self="closeTimetable">
        <div class="timetable-modal">
          <div class="timetable-header">
            <h3>Plan zajęć</h3>
            <button class="timetable-close" @click="closeTimetable">&times;</button>
          </div>
          <div class="timetable-body">
            <LoadingBox v-if="timetableLoading" />
            <p v-else-if="timetableError" class="timetable-error">{{ timetableError }}</p>
            <template v-else-if="timetableData">
              <div class="tt-grid-wrap">
                <div class="tt-grid">
                  <div class="tt-corner"></div>
                  <div v-for="(d, i) in dayAbbr" :key="d" class="tt-day-header">{{ d }}</div>
                  <template v-for="hour in gridHours" :key="hour">
                    <div class="tt-time-label">{{ String(hour).padStart(2, '0') }}:00</div>
                    <div
                      v-for="(d, di) in dayKeys"
                      :key="`${d}-${hour}`"
                      class="tt-cell"
                      :class="{ available: hasSlot(d, hour) }"
                    ></div>
                  </template>
                </div>
              </div>
            </template>
            <p v-else class="timetable-empty">Brak danych o planie zajęć.</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.teacher-panel {
  width: 100%;
  max-width: 760px;
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
  max-height: 60vh;
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
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  flex: 1;
}

.profile-image {
  display: flex;
  justify-content: center;
}

.profile-image img {
  width: 100%;
  max-width: 240px;
  height: 240px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(79, 117, 199, 0.1);
}

.image-placeholder {
  width: 240px;
  height: 240px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72px;
  font-weight: 700;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
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
  padding: 12px;
  border-left: 3px solid var(--accent);
}

.profile-bio {
  margin: 0;
  line-height: 1.6;
  color: var(--text);
  font-size: 14px;
}

.tags-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
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

.timetable-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.timetable-modal {
  background: var(--surface-strong);
  border-radius: 14px;
  width: 92%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
  border: 1px solid var(--border);
}

.timetable-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}

.timetable-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.timetable-close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: var(--muted);
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
}

.timetable-close:hover {
  color: var(--text);
}

.timetable-body {
  padding: 14px 18px 18px;
  display: flex;
  justify-content: center;
}

.tt-grid-wrap {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.tt-grid {
  display: grid;
  grid-template-columns: 40px repeat(7, 1fr);
  gap: 2px;
  padding: 4px;
  background: #f3f4f6;
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
  padding: 3px 0;
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
  min-height: 18px;
  transition: background 0.08s;
}

.tt-cell.available {
  background: #4f75c7;
  border-color: #4f75c7;
}

.timetable-error {
  color: #ef4444;
  font-weight: 600;
  text-align: center;
}

.timetable-empty {
  color: var(--muted);
  text-align: center;
  font-weight: 600;
}
</style>
