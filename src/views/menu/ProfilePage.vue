<script setup>
import { reactive, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { upsertProfile, deleteProfile } from '@/services/profileService.js'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from '@/composables/useAuth.js'
import { translateAuthError } from '@/utils/authErrors.js'
import LoadingBox from '@/components/LoadingBox.vue'

const router = useRouter()
const { user, profileData, profileLoading, setProfileName, clearNeedsProfile, signOut } = useAuth()
const profile = reactive({
  name: '',
  accountType: 'student',
  age: '',
  city: '',
  gender: '',
  profile_picture: '',
})

const teachingFormats = ['Stacjonarnie', 'Z dojazdem', 'Online']
const subjectOptions = ['Matematyka', 'Język polski', 'Angielski', 'Fizyka']
const weeklyDayLabels = [
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
  'Niedziela',
]
const weeklyTimeSlots = [
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-19:00',
  '19:00-20:00',
]
const TUTOR_POST_KEY = 'korkerTutorPost'

const isEditing = ref(false)
const saving = ref(false)
const loading = ref(true)
const availabilityExpanded = ref(false)
const saveError = ref('')
const pendingAvatarFile = ref(null)
const pendingLessonPhotoFile = ref(null)
let originalProfilePicture = ''
let originalLessonPhoto = ''
const draft = reactive({
  name: profile.name,
  accountType: profile.accountType,
  age: profile.age,
  teachingFormats: [],
  city: '',
  street: '',
  homeNumber: '',
  flatNumber: '',
  gender: profile.gender,
  profile_picture: profile.profile_picture,
  lessonPhoto: '',
  lessonPrice: '',
  lessonSubject: '',
  lessonLevel: 'Liceum',
  lessonDescription: '',
  weeklyAvailability: {},
})

const strictestFormat = computed(() => {
  const sf = draft.teachingFormats
  if (sf.includes('Stacjonarnie')) return 'Stacjonarnie'
  if (sf.includes('Z dojazdem')) return 'Z dojazdem'
  if (sf.includes('Online')) return 'Online'
  return ''
})

function toDb() {
  const parts = profile.name.trim().split(/\s+/)
  return {
    name: parts[0] || '',
    surname: parts.slice(1).join(' ') || '',
    age: parseInt(profile.age, 10) || null,
    gender: profile.gender || null,
    account_type: profile.accountType || 'student',
    city: profile.city || '',
    profile_picture: profile.profile_picture || null,
  }
}

function fromDb(data) {
  if (!data) return
  profile.name = [data.name, data.surname].filter(Boolean).join(' ')
  profile.age = String(data.age ?? '')
  profile.accountType = data.account_type ?? 'student'
  profile.city = data.city ?? ''
  profile.gender = data.gender ?? ''
  profile.profile_picture = data.profile_picture ?? ''
  profile.teachingFormats = []
  profile.street = ''
  profile.homeNumber = ''
  profile.flatNumber = ''
}

function loadTutorPost() {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem(TUTOR_POST_KEY) || 'null')
  } catch {
    return null
  }
}

function saveTutorPost(post) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TUTOR_POST_KEY, JSON.stringify(post))
}

function removeTutorPost() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TUTOR_POST_KEY)
}

function createDefaultWeeklyAvailability() {
  return {
    Poniedziałek: ['10:00-11:00'],
    Wtorek: ['14:00-15:00'],
    Środa: [],
    Czwartek: ['16:00-17:00'],
    Piątek: ['18:00-19:00'],
    Sobota: [],
    Niedziela: [],
  }
}

function normalizeWeeklyAvailability(value) {
  if (Array.isArray(value)) {
    const grouped = Object.fromEntries(weeklyDayLabels.map((day) => [day, []]))
    value.forEach((slot) => {
      if (!slot?.day || !slot?.time) return
      if (!grouped[slot.day]) grouped[slot.day] = []
      grouped[slot.day].push(slot.time)
    })
    return grouped
  }

  if (value && typeof value === 'object') {
    const normalized = Object.fromEntries(weeklyDayLabels.map((day) => [day, []]))
    weeklyDayLabels.forEach((day) => {
      const slots = Array.isArray(value[day]) ? value[day] : []
      normalized[day] = [...slots]
    })
    return normalized
  }

  return createDefaultWeeklyAvailability()
}

function buildAvailabilitySlots(availability) {
  return Object.entries(availability || {}).flatMap(([day, slots]) =>
    (Array.isArray(slots) ? slots : []).map((time) => ({ day, time })),
  )
}

function toggleAvailabilitySlot(day, slot) {
  if (!draft.weeklyAvailability) {
    draft.weeklyAvailability = {}
  }

  if (!draft.weeklyAvailability[day]) {
    draft.weeklyAvailability[day] = []
  }

  const slots = draft.weeklyAvailability[day]
  const index = slots.indexOf(slot)
  if (index > -1) {
    slots.splice(index, 1)
  } else {
    slots.push(slot)
  }
}

function isAvailabilitySelected(day, slot) {
  return (draft.weeklyAvailability?.[day] || []).includes(slot)
}

function getAvailabilitySummary(day) {
  const slots = draft.weeklyAvailability?.[day] || []
  return slots.length ? slots.join(', ') : 'Brak godzin'
}

function copyMondayToWeekdays() {
  const mondaySlots = [...(draft.weeklyAvailability?.['Poniedziałek'] || [])]
  if (!mondaySlots.length) return

  const weekdays = ['Wtorek', 'Środa', 'Czwartek', 'Piątek']
  weekdays.forEach((day) => {
    draft.weeklyAvailability[day] = [...mondaySlots]
  })
}

function applySavedTutorPost(data) {
  if (data?.tutor_post) {
    const tp = data.tutor_post
    draft.lessonPhoto = tp.photo || ''
    draft.lessonPrice = String(tp.price ?? '')
    draft.lessonSubject = tp.subject || ''
    draft.lessonLevel = tp.level || 'Liceum'
    draft.lessonDescription = tp.description || ''
    draft.teachingFormats = Array.isArray(tp.teachingFormats)
      ? tp.teachingFormats
      : tp.teachingFormat
        ? [tp.teachingFormat]
        : draft.teachingFormats
    draft.city = tp.city || draft.city || ''
    draft.street = tp.street || draft.street || ''
    draft.homeNumber = tp.homeNumber || draft.homeNumber || ''
    draft.flatNumber = tp.flatNumber || draft.flatNumber || ''
  }
}

watch(
  [profileData, profileLoading],
  ([data, busy]) => {
    if (busy) return
    if (data) {
      fromDb(data)
      setProfileName(profile.name)
      applySavedTutorPost(data)
    } else {
      const meta = user.value?.user_metadata
      if (meta?.name) {
        profile.name = [meta.name, meta.surname].filter(Boolean).join(' ')
      }
      startEdit()
    }
    loading.value = false
  },
  { immediate: true },
)

function startEdit() {
  originalProfilePicture = profile.profile_picture
  originalLessonPhoto = draft.lessonPhoto || ''
  Object.assign(draft, profile)
  applySavedTutorPost(profileData.value)
  isEditing.value = true
}

async function saveProfile() {
  saveError.value = ''

  const sf = draft.accountType === 'tutor' ? strictestFormat.value : 't'
  if (draft.accountType === 'tutor') {
    if (!draft.lessonSubject) {
      saveError.value = 'Wybierz przedmiot'
      return
    }
    if (!draft.lessonPrice) {
      saveError.value = 'Podaj stawkę za lekcję'
      return
    }
    if (!draft.teachingFormats.length) {
      saveError.value = 'Wybierz formę nauczania'
      return
    }
  }
  if ((sf === 'Stacjonarnie' || draft.accountType !== 'tutor') && !draft.city) {
    saveError.value = 'Podaj miasto'
    return
  }
  if (sf === 'Stacjonarnie' && !draft.street) {
    saveError.value = 'Podaj ulicę'
    return
  }

  const ageNum = parseInt(draft.age, 10)
  if (draft.age !== '' && (isNaN(ageNum) || ageNum < 1 || ageNum > 100)) {
    saveError.value = 'Wiek musi być liczbą od 1 do 100'
    return
  }

  saving.value = true
  try {
    if (pendingAvatarFile.value) {
      const file = pendingAvatarFile.value
      const path = `${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(path, file)

      if (uploadError) {
        console.error('Failed to upload avatar:', uploadError)
        saving.value = false
        return
      }

      const { data: urlData } = supabase.storage.from('profile_pictures').getPublicUrl(path)

      profile.profile_picture = urlData.publicUrl
      draft.profile_picture = urlData.publicUrl
      pendingAvatarFile.value = null
    }

    if (pendingLessonPhotoFile.value) {
      const file = pendingLessonPhotoFile.value
      const path = `lesson-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(path, file)

      if (uploadError) {
        console.error('Failed to upload lesson photo:', uploadError)
        saving.value = false
        return
      }

      const { data: urlData } = supabase.storage.from('profile_pictures').getPublicUrl(path)
      draft.lessonPhoto = urlData.publicUrl
      pendingLessonPhotoFile.value = null
    }

    Object.assign(profile, draft)

    let tutorPost = null
    if (draft.accountType === 'tutor') {
      tutorPost = {
        subject: draft.lessonSubject || '',
        level: draft.lessonLevel || 'Liceum',
        price: Number(draft.lessonPrice) || null,
        tags: [...draft.teachingFormats],
        description: draft.lessonDescription || '',
        photo: draft.lessonPhoto || null,
        teachingFormats: [...draft.teachingFormats],
        city: draft.city || '',
        street: draft.street || '',
        homeNumber: draft.homeNumber || '',
        flatNumber: draft.flatNumber || '',
      }
    }

    const result = await upsertProfile(toDb(), user.value?.id, tutorPost)
    if (result) {
      fromDb(result)
      profileData.value = { ...result }
    }

    setProfileName(profile.name)
    clearNeedsProfile()
    isEditing.value = false
  } catch (err) {
    saveError.value = translateAuthError(err)
  } finally {
    saving.value = false
  }
}

function cancelEdit() {
  if (pendingAvatarFile.value) {
    URL.revokeObjectURL(profile.profile_picture)
    pendingAvatarFile.value = null
  }
  profile.profile_picture = originalProfilePicture
  Object.assign(draft, profile)
  isEditing.value = false
}

const confirmingDelete = ref(false)
const deleting = ref(false)
const deleteError = ref('')

async function deleteAccount() {
  deleteError.value = ''
  deleting.value = true
  try {
    await deleteProfile(user.value?.id)
    try {
      await signOut()
    } catch {
      // account already removed from auth.users, session is stale
    }
    router.push('/')
  } catch (err) {
    deleteError.value = translateAuthError(err)
  } finally {
    deleting.value = false
  }
}

function triggerAvatarUpload() {
  document.getElementById('avatar-input')?.click()
}

function triggerLessonPhotoUpload() {
  document.getElementById('lesson-photo-input')?.click()
}

function onAvatarChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  pendingAvatarFile.value = file
  profile.profile_picture = URL.createObjectURL(file)
  draft.profile_picture = profile.profile_picture
}

function onLessonPhotoChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  pendingLessonPhotoFile.value = file
  draft.lessonPhoto = URL.createObjectURL(file)
}

function formattedLocation() {
  return profile.city || ''
}

function toggleTeachingFormat(format) {
  const idx = draft.teachingFormats.indexOf(format)
  if (idx > -1) {
    draft.teachingFormats.splice(idx, 1)
  } else {
    draft.teachingFormats.push(format)
  }
}
</script>

<template>
  <div class="profile-card">
    <LoadingBox v-if="loading" />
    <template v-else>
      <div class="header">
        <div
          class="avatar-wrapper"
          :class="{ 'avatar-editable': isEditing }"
          @click="isEditing ? triggerAvatarUpload() : null"
        >
          <img v-if="profile.profile_picture" :src="profile.profile_picture" class="avatar" />
          <span v-else class="avatar avatar-letter">{{
            profile.name?.charAt(0)?.toUpperCase() || '?'
          }}</span>
          <div v-if="isEditing" class="avatar-overlay">
            <span class="change-prof-pic">Zmień</span>
          </div>
        </div>
        <input
          id="avatar-input"
          type="file"
          accept="image/*"
          class="avatar-input"
          @change="onAvatarChange"
        />
        <template v-if="isEditing">
          <label class="field-row name-input-label">
            <span class="field-label">Imię i nazwisko</span>
            <input v-model="draft.name" class="name-input" placeholder="Jan Kowalski" />
          </label>
        </template>
        <template v-else>
          <h2>{{ profile.name }}</h2>
        </template>
      </div>

      <div class="divider"></div>

      <div class="details">
        <template v-if="isEditing">
          <label class="field-row">
            <span class="field-label">Typ konta<span class="req">*</span></span>
            <select v-model="draft.accountType">
              <option value="" disabled>Wybierz typ konta</option>
              <option value="student">Student</option>
              <option value="tutor">Korepetytor</option>
            </select>
          </label>
          <label class="field-row">
            <span class="field-label">Wiek</span>
            <input v-model="draft.age" type="number" placeholder="25" />
          </label>
          <template v-if="draft.accountType === 'tutor'">
            <label class="field-row">
              <span class="field-label">Forma nauczania<span class="req">*</span></span>
              <div class="format-options-row">
                <button
                  v-for="fmt in teachingFormats"
                  :key="fmt"
                  type="button"
                  class="format-option"
                  :class="{ selected: draft.teachingFormats.includes(fmt) }"
                  @click="toggleTeachingFormat(fmt)"
                >
                  {{ fmt }}
                </button>
              </div>
            </label>
            <template v-if="strictestFormat">
              <label class="field-row">
                <span class="field-label"
                  >Miasto<span v-if="strictestFormat !== 'Online'" class="req">*</span></span
                >
                <input v-model="draft.city" placeholder="Warszawa" />
              </label>
              <template v-if="strictestFormat === 'Stacjonarnie'">
                <label class="field-row">
                  <span class="field-label">Ulica<span class="req">*</span></span>
                  <input v-model="draft.street" placeholder="Marszałkowska" />
                </label>
                <div class="address-row">
                  <label class="field-row address-field">
                    <span class="field-label">Nr domu</span>
                    <input v-model="draft.homeNumber" placeholder="12" />
                  </label>
                  <label class="field-row address-field">
                    <span class="field-label">Nr mieszkania</span>
                    <input v-model="draft.flatNumber" placeholder="3" />
                  </label>
                </div>
              </template>
            </template>
          </template>
          <label class="field-row" v-if="draft.accountType !== 'tutor'">
            <span class="field-label">Miasto<span class="req">*</span></span>
            <input v-model="draft.city" placeholder="Warszawa" />
          </label>
          <label class="field-row">
            <span class="field-label">Płeć</span>
            <select v-model="draft.gender">
              <option value="" disabled>Wybierz płeć</option>
              <option value="male">Mężczyzna</option>
              <option value="female">Kobieta</option>
            </select>
          </label>

          <template v-if="draft.accountType === 'tutor'">
            <div class="tutor-offer-header">Twój post korepetytora</div>
            <label class="field-row">
              <span class="field-label">Przedmiot<span class="req">*</span></span>
              <div class="subject-table">
                <button
                  v-for="subject in subjectOptions"
                  :key="subject"
                  type="button"
                  class="subject-option"
                  :class="{ selected: draft.lessonSubject === subject }"
                  @click="draft.lessonSubject = subject"
                >
                  {{ subject }}
                </button>
              </div>
            </label>
            <label class="field-row">
              <span class="field-label">Poziom</span>
              <select v-model="draft.lessonLevel">
                <option value="Szkoła podstawowa">Szkoła podstawowa</option>
                <option value="Liceum">Liceum</option>
                <option value="Studia">Studia</option>
              </select>
            </label>
            <label class="field-row">
              <span class="field-label">Stawka za lekcję (zł/h)<span class="req">*</span></span>
              <input v-model="draft.lessonPrice" type="number" min="10" placeholder="50" />
            </label>
            <div class="availability-section">
              <div class="availability-header">
                <span class="field-label">Dostępne godziny w tygodniu</span>
                <span class="availability-hint"
                  >Kliknij godziny, w których chcesz prowadzić lekcje.</span
                >
                <button class="availability-copy-btn" type="button" @click="copyMondayToWeekdays">
                  Kopiuj z poniedziałku na wtorek–piątek
                </button>
              </div>
              <div class="availability-grid">
                <div v-for="day in weeklyDayLabels" :key="day" class="availability-day-card">
                  <div class="availability-day-title">{{ day }}</div>
                  <div class="availability-slot-list">
                    <button
                      v-for="slot in weeklyTimeSlots"
                      :key="`${day}-${slot}`"
                      type="button"
                      class="availability-slot"
                      :class="{ selected: isAvailabilitySelected(day, slot) }"
                      @click="toggleAvailabilitySlot(day, slot)"
                    >
                      {{ slot }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <label class="field-row">
              <span class="field-label">Opis oferty</span>
              <textarea
                v-model="draft.lessonDescription"
                placeholder="Napisz krótki opis lekcji..."
              ></textarea>
            </label>
            <label class="field-row lesson-photo-row">
              <span class="field-label">Zdjęcie oferty</span>
              <div class="lesson-photo-input">
                <button class="btn btn-secondary" type="button" @click="triggerLessonPhotoUpload">
                  Wybierz zdjęcie
                </button>
                <input
                  id="lesson-photo-input"
                  type="file"
                  accept="image/*"
                  class="avatar-input"
                  @change="onLessonPhotoChange"
                />
              </div>
              <div v-if="draft.lessonPhoto" class="lesson-photo-preview">
                <img :src="draft.lessonPhoto" alt="Zdjęcie lekcji" />
              </div>
            </label>
          </template>

          <div v-if="saveError" class="error-box">{{ saveError }}</div>

          <div class="actions">
            <button class="btn btn-primary" :disabled="saving" @click="saveProfile">
              <span v-if="saving" class="btn-spinner"></span>
              {{ saving ? 'Zapisywanie...' : 'Zapisz' }}
            </button>
            <button class="btn btn-secondary" :disabled="saving" @click="cancelEdit">Anuluj</button>
          </div>
        </template>

        <template v-else>
          <div class="info-row">
            <span class="info-label">Typ konta</span>
            <span class="info-value">{{
              profile?.accountType === 'student'
                ? 'Student'
                : profile?.accountType === 'tutor'
                  ? 'Korepetytor'
                  : ''
            }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Wiek</span>
            <span class="info-value">{{ profile.age || '' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Miasto</span>
            <span class="info-value">{{ formattedLocation() }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Płeć</span>
            <span class="info-value">{{
              profile.gender === 'male' ? 'Mężczyzna' : profile.gender === 'female' ? 'Kobieta' : ''
            }}</span>
          </div>

          <template v-if="profile.accountType === 'tutor'">
            <div class="tutor-offer-view">
              <h4>Twoja oferta korepetytora</h4>
              <div class="offer-row">
                <span class="offer-label">Przedmiot</span>
                <span class="offer-value">{{ draft.lessonSubject || 'Korepetycje' }}</span>
              </div>
              <div class="offer-row">
                <span class="offer-label">Poziom</span>
                <span class="offer-value">{{ draft.lessonLevel || 'Liceum' }}</span>
              </div>
              <div class="offer-row">
                <span class="offer-label">Stawka</span>
                <span class="offer-value">{{
                  draft.lessonPrice ? draft.lessonPrice + ' zł/h' : 'Brak'
                }}</span>
              </div>
              <div class="offer-row" v-if="draft.teachingFormats.length">
                <span class="offer-label">Forma</span>
                <span class="offer-value">{{ draft.teachingFormats.join(', ') }}</span>
              </div>
              <div class="offer-row" v-if="draft.lessonDescription">
                <span class="offer-label">Opis</span>
                <span class="offer-value">{{ draft.lessonDescription }}</span>
              </div>
              <div v-if="draft.lessonPhoto" class="offer-photo-preview">
                <img :src="draft.lessonPhoto" alt="Oferta korepetytora" />
              </div>
            </div>
          </template>
        </template>
      </div>

      <button v-if="!isEditing" class="btn btn-primary edit-btn" @click="startEdit">
        Edytuj profil
      </button>

      <template v-if="!isEditing">
        <button
          v-if="!confirmingDelete"
          class="btn btn-danger delete-btn"
          @click="confirmingDelete = true"
        >
          Usuń konto
        </button>
        <div v-else class="delete-confirm">
          <span class="delete-confirm-text">Czy na pewno chcesz usunąć konto?</span>
          <div class="delete-confirm-actions">
            <button class="btn btn-danger btn-sm" :disabled="deleting" @click="deleteAccount">
              <span v-if="deleting" class="btn-spinner"></span>
              {{ deleting ? 'Usuwanie...' : 'Tak, usuń' }}
            </button>
            <button
              class="btn btn-secondary btn-sm"
              :disabled="deleting"
              @click="confirmingDelete = false"
            >
              Anuluj
            </button>
          </div>
          <div v-if="deleteError" class="error-box">{{ deleteError }}</div>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.profile-card {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 720px;
  padding: 32px;
  margin: 0 auto;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.15);
  font-family: Inter, system-ui, sans-serif;
  color: #1f2937;
  min-height: 0;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 4px;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #eef2ff;
  display: block;
}

.avatar-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: #ffffff;
  font-size: 22px;
  font-weight: 700;
  font-family: Inter, system-ui, sans-serif;
  flex-shrink: 0;
  border: 3px solid #eef2ff;
}

.avatar-editable {
  cursor: pointer;
}

.avatar-editable .avatar {
  border-color: var(--primary-color);
  opacity: 0.85;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.avatar-editable:hover .avatar-overlay {
  background: rgba(15, 23, 42, 0.5);
}

.change-prof-pic {
  font-size: 0.9rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  color: white;
  font-weight: bold;
}

.avatar-input {
  display: none;
}

.header h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.name-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.name-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 117, 199, 0.12);
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 20px 0;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 4px;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.field-label {
  font-weight: 600;
  color: #374151;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.field-row input,
.field-row select,
.field-row textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  background: #ffffff;
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.field-row textarea {
  min-height: 100px;
  resize: vertical;
}

.field-row input:focus,
.field-row select:focus,
.field-row textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 117, 199, 0.12);
}

.tag-options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  font-size: 13px;
  background: #f8fafc;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.tag-option input {
  width: 14px;
  height: 14px;
}

.subject-table {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.subject-option {
  border: 1.5px solid #d1d5db;
  border-radius: 999px;
  background: #f8fafc;
  color: #102036;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.subject-option.selected {
  background: #eef2ff;
  border-color: #4f75c7;
  color: #1f2937;
}

.subject-option:hover {
  background: #e2e8f0;
}

.format-option {
  border: 1.5px solid #d1d5db;
  border-radius: 999px;
  background: #f8fafc;
  color: #102036;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s ease;
  outline: none;
}

.format-option.selected {
  background: #eef2ff;
  border-color: #4f75c7;
  color: #1f2937;
}

.format-option:hover {
  background: #e2e8f0;
}

.format-option:focus-visible {
  box-shadow: 0 0 0 2px rgba(79, 117, 199, 0.4);
}

.req {
  color: #dc2626;
  margin-left: 2px;
}

.format-options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.address-row {
  display: flex;
  gap: 12px;
}

.address-field {
  flex: 1;
}

.lesson-photo-row {
  gap: 12px;
}

.lesson-photo-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lesson-photo-preview {
  margin-top: 10px;
  max-width: 160px;
  max-height: 120px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(79, 117, 199, 0.15);
}

.lesson-photo-preview img,
.offer-photo-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.tutor-offer-header {
  margin-top: 12px;
  font-weight: 700;
  color: #1f2937;
}

.tutor-offer-view {
  background: #f8fafc;
  border: 1px solid rgba(79, 117, 199, 0.1);
  border-radius: 12px;
  padding: 14px;
  display: grid;
  gap: 10px;
}

.tutor-offer-view h4 {
  margin: 0;
  font-size: 15px;
  color: #1f2937;
}

.offer-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
  color: #374151;
}

.availability-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}

.availability-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.availability-hint {
  font-size: 12px;
  color: #6b7280;
}

.availability-copy-btn {
  align-self: flex-start;
  border: 1px solid rgba(79, 117, 199, 0.2);
  background: #eef2ff;
  color: #1f2937;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.availability-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.availability-day-card {
  border: 1px solid rgba(79, 117, 199, 0.15);
  border-radius: 12px;
  padding: 10px;
  background: #f8fafc;
}

.availability-day-title {
  font-size: 13px;
  font-weight: 700;
  color: #102036;
  margin-bottom: 8px;
}

.availability-slot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.availability-slot {
  border: 1px solid #d1d5db;
  border-radius: 999px;
  background: #ffffff;
  color: #374151;
  padding: 6px 8px;
  font-size: 11px;
  cursor: pointer;
}

.availability-slot.selected {
  background: #eef2ff;
  border-color: #4f75c7;
  color: #1f2937;
}

.availability-toggle {
  border: none;
  background: transparent;
  color: #4f75c7;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.availability-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: -2px;
}

.availability-day-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: #374151;
  background: #f8fafc;
  border: 1px solid rgba(79, 117, 199, 0.12);
  border-radius: 10px;
  padding: 8px 10px;
}

.availability-day {
  font-weight: 600;
  color: #102036;
}

.availability-times {
  text-align: right;
  color: #4b5563;
}

.offer-label {
  font-weight: 600;
  color: #4b5563;
}

.offer-value {
  text-align: right;
  color: #102036;
}

.offer-photo-preview {
  justify-self: center;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(79, 117, 199, 0.15);
  max-width: 200px;
  max-height: 150px;
}

.info-label {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.info-value {
  color: #1f2937;
  font-size: 15px;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
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

.btn-primary:hover:not(:disabled) {
  background: #4368b5;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-secondary {
  background: #eef2ff;
  color: #1f2937;
}

.btn-secondary:hover {
  background: #dbe0f5;
}

.edit-btn {
  width: 100%;
  padding: 12px;
}

.btn-danger {
  background: #dc2626;
  color: #ffffff;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.delete-btn {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
}

.delete-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 16px;
  border: 1px solid #fca5a5;
  border-radius: 12px;
  background: #fef2f2;
}

.delete-confirm-text {
  font-size: 14px;
  font-weight: 600;
  color: #991b1b;
  text-align: center;
}

.delete-confirm-actions {
  display: flex;
  gap: 10px;
}

.error-box {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #991b1b;
  text-align: center;
}

.name-input-label {
  width: 100%;
}
</style>
