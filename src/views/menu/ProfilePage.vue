<script setup>
import { reactive, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { upsertProfile } from '@/services/profileService.js'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from '@/composables/useAuth.js'
import { translateAuthError } from '@/utils/authErrors.js'
import { compressImage } from '@/utils/imageCompress.js'
import LoadingBox from '@/components/LoadingBox.vue'
import AvailabilityGrid from '@/components/AvailabilityGrid.vue'

const route = useRoute()
const router = useRouter()
const { user, profileData, profileLoading, setProfileName, clearNeedsProfile } = useAuth()
const profile = reactive({
  name: '',
  nickname: '',
  accountType: 'student',
  age: '',
  city: '',
  gender: '',
  profile_picture: '',
})

const tutorOffers = ref([])
const showOfferEditor = ref(false)
const editingOfferIndex = ref(-1)
const confirmingDeleteOfferIndex = ref(null)
const pendingOfferPhotoFile = ref(null)
const offerDraft = reactive({
  teachingFormats: [],
  city: '',
  street: '',
  homeNumber: '',
  flatNumber: '',
  lessonPhoto: '',
  lessonPrice: '',
  lessonSubject: '',
  lessonLevel: 'Liceum',
  lessonDescription: '',
  weeklyAvailability: {},
})
const offerSaving = ref(false)
const offerSaveError = ref('')

const subjectOptions = [
  'Język polski',
  'Język angielski',
  'Język niemiecki',
  'Matematyka',
  'Fizyka',
  'Chemia',
  'Biologia',
  'Historia',
  'Geografia',
  'Informatyka',
]
const weeklyDayLabels = [
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
  'Niedziela',
]
const saving = ref(false)
const loading = ref(true)
const saveError = ref('')
const pendingAvatarFile = ref(null)
let originalProfilePicture = ''
const draft = reactive({
  nickname: profile.nickname,
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

function toDb() {
  const parts = profile.name.trim().split(/\s+/)
  return {
    nickname: profile.nickname || '',
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
  profile.nickname = data.nickname || ''
  profile.name = [data.name, data.surname].filter(Boolean).join(' ')
  profile.age = String(data.age ?? '')
  profile.accountType = data.account_type ?? 'student'
  profile.city = data.city ?? ''
  profile.gender = data.gender ?? ''
  profile.profile_picture = data.profile_picture ?? ''
}

function applySavedTutorPost(data) {
  const tp = data?.tutor_post
  if (!tp) {
    tutorOffers.value = []
    return
  }
  const raw = Array.isArray(tp) ? tp : [tp]
  tutorOffers.value = raw.map((o) => ({
    subject: o.subject || '',
    level: o.level || 'Liceum',
    price: String(o.price ?? ''),
    description: o.description || '',
    photo: o.photo || '',
    teachingFormats: Array.isArray(o.teachingFormats) ? [...o.teachingFormats] : [],
    city: o.city || '',
    street: o.street || '',
    homeNumber: o.homeNumber || '',
    flatNumber: o.flatNumber || '',
    weeklyAvailability: Object.fromEntries(
      weeklyDayLabels.map((d) => [
        d,
        Array.isArray(o.weeklyAvailability?.[d]) ? [...o.weeklyAvailability[d]] : [],
      ]),
    ),
  }))
}

watch(
  [profileData, profileLoading],
  ([data, busy]) => {
    if (busy) return
    if (data) {
      fromDb(data)
      setProfileName(profile.name || profile.nickname)
      applySavedTutorPost(data)
    } else {
      const meta = user.value?.user_metadata
      if (meta?.name) {
        profile.name = [meta.name, meta.surname].filter(Boolean).join(' ')
      }
    }
    originalProfilePicture = profile.profile_picture
    Object.assign(draft, profile)
    applySavedTutorPost(profileData.value)
    loading.value = false
  },
  { immediate: true },
)

async function saveProfile() {
  saveError.value = ''

  if (!draft.accountType) {
    saveError.value = 'Wybierz typ konta'
    return
  }

  if (draft.accountType === 'tutor' && tutorOffers.value.length === 0) {
    saveError.value = 'Dodaj przynajmniej jedną ofertę korepetytorską'
    return
  }

  if (draft.nickname.length > LIMITS.nickname) {
    saveError.value = `Pseudonim może mieć maksymalnie ${LIMITS.nickname} znaków`
    return
  }
  if (draft.name.length > LIMITS.name) {
    saveError.value = `Imię i nazwisko może mieć maksymalnie ${LIMITS.name} znaków`
    return
  }
  if (draft.city.length > LIMITS.city) {
    saveError.value = `Miasto może mieć maksymalnie ${LIMITS.city} znaków`
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
      if (file.size > 3 * 1024 * 1024) {
        saveError.value = 'Zdjęcie profilowe może mieć maksymalnie 3 MB'
        saving.value = false
        return
      }
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

    Object.assign(profile, draft)

    let tutorPost = null
    if (draft.accountType === 'tutor') {
      tutorPost = tutorOffers.value.map((o) => ({
        subject: o.subject || '',
        level: o.level || 'Liceum',
        price: Number(o.price) || null,
        description: o.description || '',
        photo: o.photo || null,
        teachingFormats: [...o.teachingFormats],
        city: o.city || '',
        street: o.street || '',
        homeNumber: o.homeNumber || '',
        flatNumber: o.flatNumber || '',
        weeklyAvailability: Object.fromEntries(
          weeklyDayLabels.map((d) => [d, [...(o.weeklyAvailability?.[d] || [])]]),
        ),
        avail_hours: weeklyDayLabels.map((d) =>
          (o.weeklyAvailability?.[d] || []).reduce((mask, slot) => {
            const h = parseInt(slot.split(':')[0], 10)
            return mask | (1 << h)
          }, 0),
        ),
      }))
    }

    const result = await upsertProfile(toDb(), user.value?.id, tutorPost)
    if (result) {
      fromDb(result)
      profileData.value = { ...result }
    }

    setProfileName(profile.name || profile.nickname)
    clearNeedsProfile()
    if (profile.nickname) {
      router.push('/user/' + encodeURIComponent(profile.nickname))
    } else {
      router.push('/')
    }
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
  applySavedTutorPost(profileData.value)
  showOfferEditor.value = false
  confirmingDeleteOfferIndex.value = null
  if (profile.nickname) {
    router.push('/user/' + encodeURIComponent(profile.nickname))
  } else {
    router.push('/')
  }
}

const LIMITS = {
  nickname: 30,
  name: 30,
  city: 50,
  street: 50,
  homeNumber: 10,
  flatNumber: 10,
  description: 300,
}

function triggerAvatarUpload() {
  document.getElementById('avatar-input')?.click()
}

async function pickAndCompressAvatar(file) {
  if (!file) return
  if (file.type.startsWith('image/')) {
    file = await compressImage(file, { maxWidth: 128, maxHeight: 128, maxSizeMB: 3 })
  }
  if (file.size > 3 * 1024 * 1024) return
  pendingAvatarFile.value = file
  profile.profile_picture = URL.createObjectURL(file)
  draft.profile_picture = profile.profile_picture
}

function onAvatarChange(event) {
  pickAndCompressAvatar(event.target.files?.[0])
}

function formattedLocation() {
  return profile.city || ''
}

function getOfferLessonPlace(offer) {
  if (!offer) return ''
  if (typeof offer.lessonPlace === 'string' && offer.lessonPlace.trim()) return offer.lessonPlace
  if (Array.isArray(offer.teachingFormats) && offer.teachingFormats.length) {
    return offer.teachingFormats[0]
  }
  if (typeof offer.teachingFormat === 'string' && offer.teachingFormat.trim()) {
    return offer.teachingFormat
  }
  return ''
}

const offerNeedsAddress = computed(() => {
  return (
    offerDraft.teachingFormats.includes('Stacjonarnie') ||
    offerDraft.teachingFormats.includes('Z dojazdem')
  )
})

function toggleOfferFormat(fmt) {
  const idx = offerDraft.teachingFormats.indexOf(fmt)
  if (idx > -1) {
    offerDraft.teachingFormats.splice(idx, 1)
  } else {
    offerDraft.teachingFormats.push(fmt)
  }
}

function resetOfferDraft() {
  offerDraft.lessonSubject = ''
  offerDraft.lessonLevel = 'Liceum'
  offerDraft.lessonPrice = ''
  offerDraft.lessonDescription = ''
  offerDraft.lessonPhoto = ''
  offerDraft.teachingFormats = []
  offerDraft.city = ''
  offerDraft.street = ''
  offerDraft.homeNumber = ''
  offerDraft.flatNumber = ''
  offerDraft.weeklyAvailability = {}
  pendingOfferPhotoFile.value = null
}

function openNewOffer() {
  resetOfferDraft()
  editingOfferIndex.value = -1
  offerSaveError.value = ''
  showOfferEditor.value = true
}

function openEditOffer(index) {
  editingOfferIndex.value = index
  const offer = tutorOffers.value[index]
  offerDraft.lessonSubject = offer.subject
  offerDraft.lessonLevel = offer.level
  offerDraft.lessonPrice = offer.price
  offerDraft.lessonDescription = offer.description
  offerDraft.lessonPhoto = offer.photo
  offerDraft.teachingFormats = Array.isArray(offer.teachingFormats)
    ? [...offer.teachingFormats]
    : getOfferLessonPlace(offer)
      ? [getOfferLessonPlace(offer)]
      : []
  offerDraft.city = offer.city
  offerDraft.street = offer.street
  offerDraft.homeNumber = offer.homeNumber
  offerDraft.flatNumber = offer.flatNumber
  offerDraft.weeklyAvailability = Object.fromEntries(
    weeklyDayLabels.map((d) => [d, [...(offer.weeklyAvailability?.[d] || [])]]),
  )
  pendingOfferPhotoFile.value = null
  offerSaveError.value = ''
  showOfferEditor.value = true
}

function closeOfferEditor() {
  showOfferEditor.value = false
  if (pendingOfferPhotoFile.value) {
    URL.revokeObjectURL(offerDraft.lessonPhoto)
    pendingOfferPhotoFile.value = null
  }
}

async function saveOffer() {
  offerSaveError.value = ''

  if (!offerDraft.lessonSubject) {
    offerSaveError.value = 'Wybierz przedmiot'
    return
  }
  if (!offerDraft.lessonPrice) {
    offerSaveError.value = 'Podaj stawkę za lekcję'
    return
  }
  if (!offerDraft.teachingFormats.length) {
    offerSaveError.value = 'Wybierz miejsce lekcji'
    return
  }
  if (offerNeedsAddress.value && !offerDraft.city) {
    offerSaveError.value = 'Podaj miasto'
    return
  }
  if (offerNeedsAddress.value && !offerDraft.street) {
    offerSaveError.value = 'Podaj ulicę'
    return
  }
  if (offerDraft.city.length > LIMITS.city) {
    offerSaveError.value = `Miasto może mieć maksymalnie ${LIMITS.city} znaków`
    return
  }
  if (offerDraft.street.length > LIMITS.street) {
    offerSaveError.value = `Ulica może mieć maksymalnie ${LIMITS.street} znaków`
    return
  }
  if (offerDraft.homeNumber.length > LIMITS.homeNumber) {
    offerSaveError.value = `Numer domu może mieć maksymalnie ${LIMITS.homeNumber} znaków`
    return
  }
  if (offerDraft.flatNumber.length > LIMITS.flatNumber) {
    offerSaveError.value = `Numer mieszkania może mieć maksymalnie ${LIMITS.flatNumber} znaków`
    return
  }
  if (offerDraft.lessonDescription.length > LIMITS.description) {
    offerSaveError.value = `Opis oferty może mieć maksymalnie ${LIMITS.description} znaków`
    return
  }

  offerSaving.value = true
  try {
    if (pendingOfferPhotoFile.value) {
      const file = pendingOfferPhotoFile.value
      if (file.size > 5 * 1024 * 1024) {
        offerSaveError.value = 'Zdjęcie oferty może mieć maksymalnie 5 MB'
        offerSaving.value = false
        return
      }
      const path = `lesson-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(path, file)

      if (uploadError) {
        console.error('Failed to upload lesson photo:', uploadError)
        offerSaving.value = false
        return
      }

      const { data: urlData } = supabase.storage.from('profile_pictures').getPublicUrl(path)
      offerDraft.lessonPhoto = urlData.publicUrl
      pendingOfferPhotoFile.value = null
    }

    const offer = {
      subject: offerDraft.lessonSubject,
      level: offerDraft.lessonLevel,
      price: String(offerDraft.lessonPrice),
      description: offerDraft.lessonDescription,
      photo: offerDraft.lessonPhoto || null,
      teachingFormats: [...offerDraft.teachingFormats],
      city: offerDraft.city,
      street: offerDraft.street,
      homeNumber: offerDraft.homeNumber,
      flatNumber: offerDraft.flatNumber,
      weeklyAvailability: Object.fromEntries(
        weeklyDayLabels.map((d) => [d, [...(offerDraft.weeklyAvailability?.[d] || [])]]),
      ),
    }

    if (editingOfferIndex.value === -1) {
      tutorOffers.value.push(offer)
    } else {
      tutorOffers.value[editingOfferIndex.value] = offer
    }
    showOfferEditor.value = false
  } catch (err) {
    offerSaveError.value = translateAuthError(err)
  } finally {
    offerSaving.value = false
  }
}

function confirmDeleteOffer(index) {
  confirmingDeleteOfferIndex.value = index
}

function executeDeleteOffer() {
  if (confirmingDeleteOfferIndex.value !== null) {
    tutorOffers.value.splice(confirmingDeleteOfferIndex.value, 1)
    confirmingDeleteOfferIndex.value = null
  }
}

function cancelDeleteOffer() {
  confirmingDeleteOfferIndex.value = null
}

function triggerOfferPhotoUpload() {
  document.getElementById('offer-photo-input')?.click()
}

function onOfferPhotoChange(event) {
  pickAndCompressOfferPhoto(event.target.files?.[0])
}

async function pickAndCompressOfferPhoto(file) {
  if (!file) return
  if (file.type.startsWith('image/')) {
    file = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, maxSizeMB: 5 })
  }
  if (file.size > 5 * 1024 * 1024) return
  pendingOfferPhotoFile.value = file
  offerDraft.lessonPhoto = URL.createObjectURL(file)
}
</script>

<template>
  <div class="profile-card">
    <LoadingBox v-if="loading" />
    <template v-else>
      <div class="header">
        <div class="avatar-wrapper avatar-editable" @click="triggerAvatarUpload()">
          <img v-if="profile.profile_picture" :src="profile.profile_picture" class="avatar" />
          <span v-else class="avatar avatar-letter">{{
            profile.nickname?.charAt(0)?.toUpperCase() ||
            profile.name?.charAt(0)?.toUpperCase() ||
            '?'
          }}</span>
          <div class="avatar-overlay">
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
        <label class="field-row name-input-label">
          <span class="field-label">Pseudonim</span>
          <input
            v-model="draft.nickname"
            class="name-input"
            placeholder="Pozostaw puste aby wygenerować"
            :maxlength="LIMITS.nickname"
          />
        </label>
        <label class="field-row name-input-label">
          <span class="field-label">Imię i nazwisko</span>
          <input
            v-model="draft.name"
            class="name-input"
            placeholder="Jan Kowalski"
            :maxlength="LIMITS.name"
          />
        </label>
      </div>

      <div class="divider"></div>

      <div class="details">
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
          <div class="tutor-offers-section">
            <div class="tutor-offers-header">Twoje oferty korepetytorskie</div>

            <div v-for="(offer, index) in tutorOffers" :key="index" class="tutor-offer-card">
              <div class="offer-preview">
                <div class="offer-preview-row">
                  <span class="offer-preview-label">Przedmiot</span>
                  <span class="offer-preview-value">{{ offer.subject || 'Korepetycje' }}</span>
                </div>
                <div class="offer-preview-row">
                  <span class="offer-preview-label">Stawka</span>
                  <span class="offer-preview-value">{{
                    offer.price ? offer.price + ' zł/h' : 'Brak'
                  }}</span>
                </div>
                <div class="offer-preview-row">
                  <span class="offer-preview-label">Poziom</span>
                  <span class="offer-preview-value">{{ offer.level || 'Liceum' }}</span>
                </div>
                <div class="offer-preview-row" v-if="offer.teachingFormats.length">
                  <span class="offer-preview-label">Forma</span>
                  <span class="offer-preview-value">{{ offer.teachingFormats.join(', ') }}</span>
                </div>
              </div>
              <div class="offer-card-actions">
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  @click="openEditOffer(index)"
                >
                  Edytuj
                </button>
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  @click="confirmDeleteOffer(index)"
                >
                  Usuń
                </button>
              </div>
            </div>

            <button
              v-if="tutorOffers.length < 5"
              type="button"
              class="btn btn-secondary add-offer-btn"
              @click="openNewOffer"
            >
              + Dodaj ofertę ({{ tutorOffers.length }}/5)
            </button>

            <div v-if="confirmingDeleteOfferIndex !== null" class="delete-offer-confirm">
              <span class="delete-confirm-text">Czy na pewno chcesz usunąć tę ofertę?</span>
              <div class="delete-confirm-actions">
                <button class="btn btn-danger btn-sm" @click="executeDeleteOffer">Tak, usuń</button>
                <button class="btn btn-secondary btn-sm" @click="cancelDeleteOffer">Anuluj</button>
              </div>
            </div>
          </div>
        </template>
        <label class="field-row" v-if="draft.accountType !== 'tutor'">
          <span class="field-label">Miasto<span class="req">*</span></span>
          <input v-model="draft.city" placeholder="Warszawa" :maxlength="LIMITS.city" />
        </label>
        <label class="field-row">
          <span class="field-label">Płeć</span>
          <select v-model="draft.gender">
            <option value="" disabled>Wybierz płeć</option>
            <option value="male">Mężczyzna</option>
            <option value="female">Kobieta</option>
          </select>
        </label>

        <div v-if="saveError" class="error-box">{{ saveError }}</div>

        <div class="actions">
          <button class="btn btn-primary" :disabled="saving" @click="saveProfile">
            <span v-if="saving" class="btn-spinner"></span>
            {{ saving ? 'Zapisywanie...' : 'Zapisz' }}
          </button>
          <button class="btn btn-secondary" :disabled="saving" @click="cancelEdit">Anuluj</button>
        </div>
      </div>

      <!-- Offer Editor Overlay -->
      <div v-if="showOfferEditor" class="offer-editor-overlay" @click.self="closeOfferEditor">
        <div class="offer-editor-modal">
          <div class="offer-editor-header">
            <h3>{{ editingOfferIndex === -1 ? 'Nowa oferta' : 'Edytuj ofertę' }}</h3>
            <button type="button" class="detail-close" @click="closeOfferEditor">×</button>
          </div>
          <div class="offer-editor-body">
            <label class="field-row">
              <span class="field-label">Przedmiot<span class="req">*</span></span>
              <div class="subject-table">
                <button
                  v-for="subject in subjectOptions"
                  :key="subject"
                  type="button"
                  class="subject-option"
                  :class="{ selected: offerDraft.lessonSubject === subject }"
                  @click="offerDraft.lessonSubject = subject"
                >
                  {{ subject }}
                </button>
              </div>
            </label>
            <label class="field-row">
              <span class="field-label">Poziom</span>
              <select v-model="offerDraft.lessonLevel">
                <option value="Szkoła podstawowa">Szkoła podstawowa</option>
                <option value="Liceum">Liceum</option>
                <option value="Studia">Studia</option>
              </select>
            </label>
            <label class="field-row">
              <span class="field-label">Stawka za lekcję (zł/h)<span class="req">*</span></span>
              <input v-model="offerDraft.lessonPrice" type="number" min="10" placeholder="50" />
            </label>
            <label class="field-row">
              <span class="field-label">Miejsce lekcji<span class="req">*</span></span>
              <div class="format-options-row">
                <button
                  v-for="fmt in ['Online', 'Stacjonarnie', 'Z dojazdem']"
                  :key="fmt"
                  type="button"
                  class="format-option"
                  :class="{ selected: offerDraft.teachingFormats.includes(fmt) }"
                  @click="toggleOfferFormat(fmt)"
                >
                  {{ fmt }}
                </button>
              </div>
            </label>
            <template v-if="offerNeedsAddress">
              <label class="field-row">
                <span class="field-label">Miasto<span class="req">*</span></span>
                <input v-model="offerDraft.city" placeholder="Warszawa" :maxlength="LIMITS.city" />
              </label>
              <template v-if="offerDraft.teachingFormats.includes('Stacjonarnie')">
                <label class="field-row">
                  <span class="field-label">Ulica<span class="req">*</span></span>
                  <input
                    v-model="offerDraft.street"
                    placeholder="Marszałkowska"
                    :maxlength="LIMITS.street"
                  />
                </label>
                <div class="address-row">
                  <label class="field-row address-field">
                    <span class="field-label">Nr domu</span>
                    <input
                      v-model="offerDraft.homeNumber"
                      placeholder="12"
                      :maxlength="LIMITS.homeNumber"
                    />
                  </label>
                  <label class="field-row address-field">
                    <span class="field-label">Nr mieszkania</span>
                    <input
                      v-model="offerDraft.flatNumber"
                      placeholder="3"
                      :maxlength="LIMITS.flatNumber"
                    />
                  </label>
                </div>
              </template>
            </template>
            <div>
              <AvailabilityGrid
                :availability="offerDraft.weeklyAvailability"
                @update:availability="offerDraft.weeklyAvailability = $event"
              />
            </div>
            <label class="field-row">
              <span class="field-label">Opis oferty</span>
              <div class="description-wrap">
                <textarea
                  v-model="offerDraft.lessonDescription"
                  placeholder="Napisz krótki opis lekcji..."
                  :maxlength="LIMITS.description"
                ></textarea>
                <span
                  v-if="offerDraft.lessonDescription.length"
                  class="desc-char-count"
                  :class="{
                    'char-count-over': offerDraft.lessonDescription.length > LIMITS.description,
                  }"
                >
                  {{ LIMITS.description - offerDraft.lessonDescription.length }}
                </span>
              </div>
              <span
                v-if="offerDraft.lessonDescription.length > LIMITS.description"
                class="field-warning"
              >
                Opis może mieć maksymalnie {{ LIMITS.description }} znaków
              </span>
            </label>
            <label class="field-row lesson-photo-row">
              <span class="field-label">Zdjęcie oferty</span>
              <div class="lesson-photo-input">
                <button class="btn btn-secondary" type="button" @click="triggerOfferPhotoUpload">
                  Wybierz zdjęcie
                </button>
                <input
                  id="offer-photo-input"
                  type="file"
                  accept="image/*"
                  class="avatar-input"
                  @change="onOfferPhotoChange"
                />
              </div>
              <div v-if="offerDraft.lessonPhoto" class="lesson-photo-preview">
                <img :src="offerDraft.lessonPhoto" alt="Zdjęcie lekcji" />
              </div>
            </label>
            <div v-if="offerSaveError" class="error-box">{{ offerSaveError }}</div>
          </div>
          <div class="offer-editor-footer">
            <button class="btn btn-primary" :disabled="offerSaving" @click="saveOffer">
              <span v-if="offerSaving" class="btn-spinner"></span>
              {{ offerSaving ? 'Zapisywanie...' : 'Zapisz ofertę' }}
            </button>
            <button class="btn btn-secondary" :disabled="offerSaving" @click="closeOfferEditor">
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.profile-card {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 1000px;
  min-width: 0;
  padding: 32px;
  margin: 0 auto;
  box-shadow: var(--shadow-soft);
  font-family: Inter, system-ui, sans-serif;
  color: var(--text);
  min-height: 0;
  box-sizing: border-box;
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
  font-size: 22px;
  font-weight: 700;
  font-family: Inter, system-ui, sans-serif;
  flex-shrink: 0;
  border: 3px solid var(--border);
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

.name-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  background: var(--surface);
  color: var(--text);
}

.name-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 117, 199, 0.12);
}

.divider {
  height: 1px;
  background: var(--border);
  margin: 20px 0;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.field-label {
  font-weight: 600;
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.field-row input,
.field-row select,
.field-row textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  background: var(--surface);
  color: var(--text);
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.field-row textarea {
  min-height: 100px;
  resize: vertical;
}
.description-wrap {
  position: relative;
}
.desc-char-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 11px;
  color: var(--muted);
  pointer-events: none;
  line-height: 1;
}
.desc-char-count.char-count-over {
  color: #ef4444;
  font-weight: 600;
}
.field-warning {
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
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
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 13px;
  background: var(--surface-soft);
  color: var(--text);
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
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}

.subject-option {
  border: 1.5px solid var(--border);
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--text);
  padding: 10px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.subject-option.selected {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--text);
}

.subject-option.hover {
  background: rgba(138, 180, 255, 0.16);
}

.subject-option.selected.hover {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text);
}

.format-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  pointer-events: auto;
  width: auto;
  min-width: 0;
}

.format-option.selected {
  background: #eef2ff;
  border-color: var(--accent);
  color: #1f2937;
}

/* Hover is managed via .hover class to avoid persistent :hover state when clicking blank areas */
.format-option.hover {
  background: #e2e8f0;
}

.format-option:focus-visible {
  box-shadow: 0 0 0 2px rgba(79, 117, 199, 0.4);
}

.format-option.selected.hover {
  background: #3d64b0;
  border-color: #3d64b0;
}

.req {
  color: #dc2626;
  margin-left: 2px;
}
.optional {
  color: var(--muted);
  font-weight: 400;
  font-size: 11px;
  text-transform: none;
  letter-spacing: normal;
}

.format-options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
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
  width: 160px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(79, 117, 199, 0.15);
}

.lesson-photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tutor-offer-header {
  margin-top: 12px;
  font-weight: 700;
  color: var(--text);
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
  background: var(--accent);
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
  background: var(--accent-soft);
  color: var(--text);
}

.btn-secondary:hover {
  background: rgba(138, 180, 255, 0.2);
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

.tutor-offers-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tutor-offers-header {
  font-weight: 700;
  color: var(--text);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tutor-offer-card {
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.offer-preview {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.offer-preview-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.offer-preview-label {
  font-weight: 600;
  color: var(--muted);
}

.offer-preview-value {
  text-align: right;
  color: var(--text);
}

.offer-card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.add-offer-btn {
  align-self: flex-start;
}

.delete-offer-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border: 1px solid #fca5a5;
  border-radius: 12px;
  background: #fef2f2;
}

.offer-editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
}

.offer-editor-modal {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: min(92vw, 720px);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.offer-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.offer-editor-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text);
}

.detail-close {
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: 1.4rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  line-height: 1;
}

.detail-close:hover {
  background: var(--surface-hover);
}

.offer-editor-body {
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.offer-editor-footer {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
</style>
