<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from '@/composables/useAuth.js'
import { getBlockedIds, getBlockingMeIds } from '@/services/blockService.js'
import { getAverageRating } from '@/services/ratingService.js'
import { onUnmounted } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({ subjects: [], levels: [], tags: [], lessonPlaces: [], city: '' }),
  },
  likedTeachers: {
    type: Array,
    default: () => [],
  },
  isTutorAccount: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'like-teacher', 'update:selected-filters'])
const { isAuthenticated, openAuthModal } = useAuth()
const tutors = ref([])
const loading = ref(true)
const decisions = ref({})
const currentIndex = ref(0)
const blockedIds = ref(new Set())
const selectedSubjects = ref([])
const selectedLevels = ref([])
const selectedTags = ref([])
const selectedCity = ref('')
const citySearchInput = ref('')
const selectedLessonPlaces = ref([])
const swipeStartX = ref(null)
const swipeOffsetX = ref(0)
const swipeRotation = ref(0)
const cardRef = ref(null)
const showSwipeOverlay = ref(false)
const swipeHintState = ref('neutral')
const teacherRatings = ref({})

const weekdayLabels = [
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
  'Niedziela',
]
const dayAbbr = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']
const gridHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

function hasSlot(availability, day, hour) {
  const slot = `${String(hour).padStart(2, '0')}:00-${String((hour + 1) % 24).padStart(2, '0')}:00`
  return (availability?.[day] || []).includes(slot)
}

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
const levelOptions = ['Szkoła podstawowa', 'Liceum', 'Studia']
const tagOptions = ['Matura', 'Egzamin', 'Olimpiada']
const lessonPlaceOptions = ['Online', 'Stacjonarnie', 'Z dojazdem']

function normalizeChoice(value) {
  if (value == null) return ''
  const text = `${value}`.trim().toLowerCase().replace(/\s+/g, ' ')
  if (['na miejscu', 'stacjonarnie'].includes(text)) return 'stacjonarnie'
  return text
}

function normalizeChoiceList(values = []) {
  return (Array.isArray(values) ? values : [values]).map(normalizeChoice).filter(Boolean)
}

function getTutorTags(tutorPost = {}) {
  const candidates = [
    Array.isArray(tutorPost?.teachingFormats) ? tutorPost.teachingFormats : [],
    tutorPost?.teachingFormat ? [tutorPost.teachingFormat] : [],
    Array.isArray(tutorPost?.tags) ? tutorPost.tags : [],
    tutorPost?.tag ? [tutorPost.tag] : [],
  ]

  return candidates.flat().filter(Boolean)
}

function emitFilterState() {
  emit('update:selected-filters', {
    subjects: [...selectedSubjects.value],
    levels: [...selectedLevels.value],
    tags: [...selectedTags.value],
    lessonPlaces: [...selectedLessonPlaces.value],
    city: selectedCity.value,
  })
}

function getTutorKey(tutor) {
  if (!tutor) return null
  if (tutor.id != null) return String(tutor.id)
  if (tutor.name) return `name:${tutor.name}`
  return null
}

async function loadTutors() {
  if (!isAuthenticated.value) {
    loading.value = false
    return
  }

  loading.value = true

  const [blocked, blocking] = await Promise.all([getBlockedIds(), getBlockingMeIds()])
  blockedIds.value = new Set([...blocked, ...blocking])

  const { data: rows, error } = await supabase
    .from('users')
    .select('id, auth_id, name, surname, profile_picture, tutor_post')
    .eq('account_type', 'tutor')
    .not('tutor_post', 'is', null)

  if (!error && rows) {
    tutors.value = rows
      .filter((r) => r.tutor_post && !blockedIds.value.has(r.auth_id))
      .map((r, index) => {
        const tp = r.tutor_post || {}
        const renderedName = [r.name, r.surname].filter(Boolean).join(' ') || 'Korepetytor'
        return {
          id: r.id || `${renderedName}-${tp.subject || 'unknown'}-${index}`,
          auth_id: r.auth_id,
          name: renderedName,
          subject: tp.subject || '',
          level: tp.level || '',
          tags: getTutorTags(tp),
          image: tp.photo || r.profile_picture || null,
          bio: tp.description || '',
          price: tp.price || 50,
          city: tp.city || '',
          lessonPlace: tp.lessonPlace || '',
          weeklyAvailability: tp.weeklyAvailability || {},
        }
      })
  }

  loading.value = false
}

onMounted(() => {
  loadTutors()
  if (typeof window !== 'undefined') {
    window.addEventListener('korker-rating-changed', onRatingChanged)
  }
})

function onRatingChanged(e) {
  const tutorId = e?.detail?.tutorAuthId
  if (!tutorId) return
  // refresh only that tutor
  getAverageRating(tutorId)
    .then((summary) => {
      teacherRatings.value = { ...teacherRatings.value, [tutorId]: summary }
    })
    .catch(() => {})
}

watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    loadTutors()
  } else {
    tutors.value = []
    loading.value = false
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('korker-rating-changed', onRatingChanged)
  }
})
const filteredTutors = computed(() => {
  return tutors.value.filter((tutor) => {
    const tutorKey = getTutorKey(tutor)
    if (!props.isTutorAccount && tutorKey && decisions.value[tutorKey]) {
      return false
    }

    const activeSubjects = [
      ...(Array.isArray(props.filters?.subjects) ? props.filters.subjects : []),
      ...selectedSubjects.value,
    ]
    const activeLevels = [
      ...(Array.isArray(props.filters?.levels) ? props.filters.levels : []),
      ...selectedLevels.value,
    ]
    const activeTags = [
      ...(Array.isArray(props.filters?.tags) ? props.filters.tags : []),
      ...selectedTags.value,
    ]
    const activeLessonPlaces = [
      ...(Array.isArray(props.filters?.lessonPlaces) ? props.filters.lessonPlaces : []),
      ...selectedLessonPlaces.value,
    ]

    const normalizedSubjects = normalizeChoiceList(activeSubjects)
    const normalizedLevels = normalizeChoiceList(activeLevels)
    const normalizedTags = normalizeChoiceList(activeTags)
    const normalizedLessonPlaces = normalizeChoiceList(activeLessonPlaces)

    const matchesSubject =
      normalizedSubjects.length === 0 ||
      normalizedSubjects.some(
        (subject) => normalizeChoice(tutor.subject) === normalizeChoice(subject),
      )
    const matchesLevel =
      normalizedLevels.length === 0 ||
      normalizedLevels.some((level) => normalizeChoice(tutor.level) === normalizeChoice(level))
    const matchesTags =
      normalizedTags.length === 0 ||
      normalizedTags.some((tag) => normalizeChoiceList(tutor.tags).includes(tag))
    const matchesLessonPlaces =
      normalizedLessonPlaces.length === 0 ||
      normalizedLessonPlaces.some(
        (place) => normalizeChoice(tutor.lessonPlace) === normalizeChoice(place),
      )
    const cityQuery = `${selectedCity.value || props.filters?.city || ''}`.trim().toLowerCase()
    const matchesCity = !cityQuery || (tutor.city || '').toLowerCase().includes(cityQuery)

    return matchesSubject && matchesLevel && matchesTags && matchesLessonPlaces && matchesCity
  })
})

const allDecided = computed(
  () => tutors.value.length > 0 && tutors.value.every((t) => decisions.value[t.id]),
)

const currentTutor = computed(() => {
  const list = filteredTutors.value
  if (!list.length) return null

  const safeIndex = Math.min(Math.max(currentIndex.value, 0), list.length - 1)
  return list[safeIndex] || null
})

watch(
  () => props.filters,
  () => {
    currentIndex.value = 0
    resetSwipe()
  },
  { deep: true },
)

watch(
  () => props.likedTeachers,
  (teachers = []) => {
    const nextDecisions = { ...decisions.value }

    teachers.forEach((teacher) => {
      const tutorKey = getTutorKey(teacher)
      if (tutorKey) {
        nextDecisions[tutorKey] = 'good'
      }
    })

    decisions.value = nextDecisions

    const length = filteredTutors.value.length
    if (length === 0) {
      currentIndex.value = 0
      return
    }

    if (currentIndex.value >= length) {
      currentIndex.value = length - 1
    }
  },
  { deep: true, immediate: true },
)

function resetSwipe() {
  swipeStartX.value = null
  swipeOffsetX.value = 0
  swipeRotation.value = 0
  showSwipeOverlay.value = false
  swipeHintState.value = 'neutral'
}

function applyCityFilter() {
  selectedCity.value = citySearchInput.value.trim()
  emitFilterState()
}

function clearFilters() {
  selectedSubjects.value = []
  selectedLevels.value = []
  selectedTags.value = []
  selectedLessonPlaces.value = []
  selectedCity.value = ''
  citySearchInput.value = ''
  currentIndex.value = 0
  resetSwipe()
  emitFilterState()
}

function getSwipeClientX(event) {
  if (event?.touches?.length) {
    return event.touches[0].clientX
  }
  if (event?.changedTouches?.length) {
    return event.changedTouches[0].clientX
  }
  return event?.clientX ?? 0
}

function startSwipe(event) {
  if (event?.target?.closest('button')) {
    swipeStartX.value = null
    return
  }

  event.preventDefault?.()
  swipeStartX.value = getSwipeClientX(event)
  swipeOffsetX.value = 0
  swipeRotation.value = 0
  showSwipeOverlay.value = false
  swipeHintState.value = 'neutral'

  // Capture pointer to track movement even outside the card
  if (cardRef.value && event.pointerId !== undefined) {
    cardRef.value.setPointerCapture(event.pointerId)
  }
}

function moveSwipe(event) {
  if (swipeStartX.value === null) return

  const currentX = getSwipeClientX(event)
  const delta = currentX - swipeStartX.value
  swipeOffsetX.value = Math.max(-140, Math.min(140, delta))
  swipeRotation.value = Math.max(-18, Math.min(18, delta / 8))

  if (props.isTutorAccount) {
    showSwipeOverlay.value = false
    swipeHintState.value = 'neutral'
  } else if (delta > 110) {
    showSwipeOverlay.value = true
    swipeHintState.value = 'like'
  } else if (delta < -110) {
    showSwipeOverlay.value = true
    swipeHintState.value = 'dislike'
  } else {
    showSwipeOverlay.value = false
    swipeHintState.value = 'neutral'
  }

  if (Math.abs(delta) > 3) {
    event.preventDefault?.()
  }
}

function endSwipe(event) {
  if (swipeStartX.value === null) return

  if (cardRef.value && event.pointerId !== undefined) {
    cardRef.value.releasePointerCapture(event.pointerId)
  }

  const currentX = getSwipeClientX(event)
  const delta = currentX - swipeStartX.value

  if (props.isTutorAccount) {
    if (delta < -80 || delta > 80) {
      nextTutor()
    } else {
      resetSwipe()
    }
    return
  }

  if (delta > 80) {
    handleDecision(true)
  } else if (delta < -80) {
    handleDecision(false)
  } else {
    resetSwipe()
  }
}

function likeTutor() {
  addCurrentTutorToList()
}

function dislikeTutor() {
  const tutor = currentTutor.value
  if (!tutor) return

  decisions.value[String(tutor.id)] = 'bad'
  nextTutor()
}

function addCurrentTutorToList() {
  const tutor = currentTutor.value
  if (!tutor) return

  const likedTutor = { ...tutor, id: String(tutor.id) }
  const tutorKey = getTutorKey(likedTutor)
  if (tutorKey) {
    decisions.value[tutorKey] = 'good'
  }
  emit('like-teacher', likedTutor)
  nextTutor()
}

function handleDecision(isLiked) {
  if (isLiked) {
    likeTutor()
  } else {
    dislikeTutor()
  }
}

function nextTutor() {
  resetSwipe()

  const remaining = filteredTutors.value.length
  if (remaining === 0) {
    currentIndex.value = 0
    return
  }

  const nextIndex = currentIndex.value + 1
  currentIndex.value = nextIndex >= remaining ? 0 : nextIndex
}

function toggleSelection(category, value) {
  const targetArray =
    category === 'subjects'
      ? selectedSubjects.value
      : category === 'levels'
        ? selectedLevels.value
        : category === 'lessonPlace'
          ? selectedLessonPlaces.value
          : selectedTags.value

  const index = targetArray.indexOf(value)
  if (index > -1) {
    targetArray.splice(index, 1)
  } else {
    targetArray.push(value)
  }
  currentIndex.value = 0
  resetSwipe()
  emitFilterState()
}

function closePage() {
  emit('close')
}

async function refreshTeacherRatings(teachersList = []) {
  const ids = [...new Set(teachersList.map((teacher) => teacher?.auth_id).filter(Boolean))]
  for (const id of ids) {
    try {
      const summary = await getAverageRating(id)
      teacherRatings.value[id] = summary
    } catch {
      // ignore
    }
  }
}

watch(
  () => tutors.value,
  (teachers = []) => {
    refreshTeacherRatings(teachers)
  },
  { deep: true, immediate: true },
)

function getTeacherRatingValue(teacher) {
  const summary = teacherRatings.value?.[teacher?.auth_id]
  if (!summary || summary.average == null) return 0
  return Number(summary.average || 0)
}

function getStarFill(rating, index) {
  const diff = Number(rating || 0) - index
  if (diff >= 1) return 'filled'
  if (diff >= 0.5) return 'half'
  return 'empty'
}
</script>

<template>
  <div>
    <div
      v-if="!isAuthenticated || isAuthenticated"
      class="find-korks-panel"
      :class="{ 'guest-state': !isAuthenticated }"
    >
      <div
        class="tutors-content"
        :class="{ 'empty-results-layout': isAuthenticated && !filteredTutors.length }"
      >
        <!-- Plan lekcji (left) -->
        <div v-if="filteredTutors.length && currentTutor" class="tt-section">
          <div class="tt-section-header">Plan lekcji</div>
          <div class="tt-grid-wrap">
            <div class="tt-grid">
              <div class="tt-corner"></div>
              <div v-for="d in dayAbbr" :key="d" class="tt-day-h">{{ d }}</div>
              <template v-for="hour in gridHours" :key="hour">
                <div class="tt-time-l">{{ String(hour).padStart(2, '0') }}:00</div>
                <div
                  v-for="day in weekdayLabels"
                  :key="`${day}-${hour}`"
                  class="tt-c"
                  :class="{ on: hasSlot(currentTutor?.weeklyAvailability, day, hour) }"
                ></div>
              </template>
            </div>
          </div>
          <div v-if="currentTutor.bio || currentTutor.lessonDescription" class="bio-box">
            <p>{{ currentTutor.bio || currentTutor.lessonDescription }}</p>
          </div>
        </div>

        <!-- Teacher panel (center) -->
        <div class="tutor-section">
          <div v-if="!isAuthenticated" class="auth-required-card">
            <h3>Aby szukać nauczycieli</h3>
            <p>
              Zarejestruj konto lub zaloguj się, żeby przeglądać korepetytorów i dodawać ich do
              swojej listy.
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

          <div
            v-else-if="filteredTutors.length && currentTutor"
            ref="cardRef"
            class="tutor-card"
            @pointerdown="startSwipe"
            @pointermove="moveSwipe"
            @pointerup="endSwipe"
            @pointercancel="endSwipe"
            @dragstart.prevent
            :style="{
              '--swipe-offset': `${swipeOffsetX}px`,
              '--swipe-rotation': `${swipeRotation}deg`,
            }"
          >
            <div
              class="card-image"
              :class="{
                'swiping-left':
                  !props.isTutorAccount && showSwipeOverlay && swipeHintState === 'dislike',
                'swiping-right':
                  !props.isTutorAccount && showSwipeOverlay && swipeHintState === 'like',
              }"
            >
              <div
                v-if="showSwipeOverlay && swipeHintState === 'dislike' && !props.isTutorAccount"
                class="swipe-indicator dislike"
              >
                <span>✕</span>
              </div>
              <div
                v-else-if="showSwipeOverlay && swipeHintState === 'like' && !props.isTutorAccount"
                class="swipe-indicator like"
              >
                <span>✓</span>
              </div>
              <div v-if="currentTutor.image" class="swipe-image-wrapper">
                <img
                  class="swipe-image"
                  :src="currentTutor.image"
                  :alt="currentTutor.name"
                  draggable="false"
                  @dragstart.prevent
                />
              </div>
            </div>

            <div class="card-rating-pill">
              <div
                class="rating-stars compact"
                :aria-label="`Ocena ${getTeacherRatingValue(currentTutor).toFixed(1)} z 5`"
              >
                <span v-for="index in 5" :key="index" class="star-button">
                  <span
                    :class="['star', getStarFill(getTeacherRatingValue(currentTutor), index - 1)]"
                    >★</span
                  >
                </span>
              </div>
              <span class="rating-value"
                >{{ getTeacherRatingValue(currentTutor).toFixed(1) }} / 5</span
              >
            </div>

            <div class="card-info">
              <div class="tutor-main-info">
                <div class="browse-note"></div>
                <div class="tutor-summary-row">
                  <div class="tutor-summary-card">
                    <h3 class="tutor-name">{{ currentTutor.name }}</h3>
                    <p class="tutor-meta">
                      {{ currentTutor.subject || currentTutor.lessonSubject || 'Korepetycje' }} •
                      {{ currentTutor.level || currentTutor.lessonLevel || 'Liceum' }}
                      <span v-if="currentTutor.city"> • {{ currentTutor.city }}</span>
                    </p>
                    <div class="tutor-rating">
                      <div
                        class="rating-stars compact"
                        :aria-label="`Ocena ${getTeacherRatingValue(currentTutor).toFixed(1)} z 5`"
                      >
                        <span v-for="index in 5" :key="index" class="star-button">
                          <span
                            :class="[
                              'star',
                              getStarFill(getTeacherRatingValue(currentTutor), index - 1),
                            ]"
                            >★</span
                          >
                        </span>
                      </div>
                      <span class="rating-value-small"
                        >{{ getTeacherRatingValue(currentTutor).toFixed(1) }} / 5</span
                      >
                    </div>
                  </div>
                  <div class="tutor-summary-card tutor-summary-price">
                    <p class="tutor-price">{{ currentTutor.price }} zł/h</p>
                  </div>
                </div>
              </div>

              <div class="tags-list">
                <span v-for="tag in currentTutor.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>

          <div
            v-else-if="isAuthenticated && !filteredTutors.length"
            class="empty-state-card inline-empty-state"
          >
            <template v-if="allDecided">
              <h3>Dotarłeś do końca</h3>
              <p>Przejrzałeś już wszystkich dostępnych korepetytorów.</p>
            </template>
            <template v-else>
              <h3>Brak nauczycieli</h3>
              <p>Nie ma wyników dla tych filtrów. Zmień kryteria albo wyczyść filtry.</p>
            </template>
            <button
              v-if="!allDecided"
              class="btn-secondary clear-filters-btn"
              type="button"
              @click="clearFilters"
            >
              Wyczyść filtry
            </button>
          </div>

          <div
            v-if="filteredTutors.length && currentTutor && !props.isTutorAccount"
            class="actions"
            @pointerdown.stop
            @pointermove.stop
            @pointerup.stop
            @pointercancel.stop
          >
            <button
              id="dislike-button"
              class="btn-dislike"
              type="button"
              aria-label="Nie pasuje"
              @click.stop.prevent="handleDecision(false)"
            >
              <span aria-hidden="true">✕</span>
              <span class="visually-hidden">Nie pasuje</span>
            </button>
            <button
              id="like-button"
              class="btn-like"
              type="button"
              aria-label="Lubię"
              @click.stop.prevent="handleDecision(true)"
            >
              <span aria-hidden="true">✔</span>
              <span class="visually-hidden">Lubię</span>
            </button>
          </div>
        </div>

        <div v-if="isAuthenticated" class="tags-filter-section">
          <div class="tags-filter-header">
            <h4>Filtry</h4>
          </div>

          <div class="filter-group">
            <h5>Miasto</h5>
            <div class="filter-options city-select-group">
              <label class="city-select-label">
                <input
                  v-model="citySearchInput"
                  type="text"
                  placeholder="Wyszukaj miasto"
                  autocomplete="off"
                />
              </label>
              <button class="city-apply-button" type="button" @click="applyCityFilter">
                Zastosuj
              </button>
            </div>
          </div>

          <div class="filter-group">
            <h5>Przedmioty</h5>
            <div class="filter-options">
              <label v-for="option in subjectOptions" :key="option">
                <input
                  type="checkbox"
                  :checked="selectedSubjects.includes(option)"
                  @change="toggleSelection('subjects', option)"
                />
                {{ option }}
              </label>
            </div>
          </div>

          <div class="filter-group">
            <h5>Poziom</h5>
            <div class="filter-options">
              <label v-for="option in levelOptions" :key="option">
                <input
                  type="checkbox"
                  :checked="selectedLevels.includes(option)"
                  @change="toggleSelection('levels', option)"
                />
                {{ option }}
              </label>
            </div>
          </div>

          <div class="filter-group">
            <h5>Miejsce lekcji</h5>
            <div class="filter-options">
              <label v-for="option in lessonPlaceOptions" :key="option">
                <input
                  type="checkbox"
                  :checked="selectedLessonPlaces.includes(option)"
                  @change="toggleSelection('lessonPlace', option)"
                />
                {{ option }}
              </label>
            </div>
          </div>

          <div class="filter-group">
            <h5>Tagi</h5>
            <div class="filter-options">
              <label v-for="option in tagOptions" :key="option">
                <input
                  type="checkbox"
                  :checked="selectedTags.includes(option)"
                  @change="toggleSelection('tags', option)"
                />
                {{ option }}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.find-korks-panel {
  width: 100%;
  max-width: 100%;
  min-height: 0;
  max-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 24px;
  overflow: hidden;
  margin: 0;
  padding: 16px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  box-sizing: border-box;
}

.tutor-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.rating-value-small {
  font-size: 13px;
  color: var(--muted);
  font-weight: 600;
}

.find-korks-header {
  padding: 24px;
  border-bottom: 2px solid rgba(79, 117, 199, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
}

.find-korks-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  margin: 8px 0 0;
  color: #4b5563;
  font-size: 13px;
}

.tutors-content {
  flex: 1;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  overflow: hidden;
  align-items: center;
  min-height: 0;
  margin: 0;
}

.tutors-content.empty-results-layout {
  grid-template-columns: 1fr auto minmax(260px, 360px);
}

.tutors-content.empty-results-layout .tutor-section {
  grid-column: 2;
}

.tutors-content.empty-results-layout .tags-filter-section {
  /* Only ensure it stays in its column; rely on the base .tags-filter-section styles for sizing */
  grid-column: 3;
}

.find-korks-panel.guest-state .tutors-content {
  display: flex;
  justify-content: center;
  align-items: center;
  grid-template-columns: 1fr;
}

.find-korks-panel.guest-state .tutor-section {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 0 8px 0;
}

.empty-state-card {
  width: min(100%, 480px);
  max-width: 480px;
  padding: 28px;
  border-radius: 24px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
  text-align: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.inline-empty-state {
  width: 100%;
  max-width: 50%;
  margin: 0 auto;
  grid-column: 1 / -1;
  justify-self: center;
  margin-right: 320px;
}

.empty-state-card h3 {
  margin: 0;
  color: var(--text);
  font-size: 22px;
}

.empty-state-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
  font-size: 15px;
}

.empty-state-action {
  margin-top: 16px;
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
  background: var(--accent-strong);
  color: white;
}

.empty-state-action:hover {
  opacity: 0.95;
}

.tags-filter-section {
  width: 100%;
  min-width: 0;
  max-height: none;
  padding: 22px 18px 110px;
  border-radius: 24px;
  overflow: hidden;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  margin: 0 0 24px;
  align-self: stretch;
  position: relative;
  pointer-events: auto;
  z-index: 1;
}

.tt-section {
  flex: 1 1 0;
  min-width: 0;
  padding: 20px;
  border-radius: 24px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
  align-self: flex-start;
  position: sticky;
  top: 24px;
  z-index: 9;
}

.tt-section-header {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
}

.tags-filter-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(79, 117, 199, 0.2);
}

.tags-filter-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.filter-group h5 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  min-width: 90px;
}

.filter-options {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}

.city-select-group {
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.city-select-label {
  display: block;
  flex: 1 1 220px;
}

.city-select-label input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface-strong);
  color: var(--text);
  font-size: 14px;
  pointer-events: auto;
  box-sizing: border-box;
}

.city-select-label input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79, 117, 199, 0.12);
}

.city-apply-button {
  padding: 10px 14px;
  border: none;
  border-radius: 999px;
  background: var(--accent);
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    opacity 0.2s ease;
}

.city-apply-button:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.filter-hint {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}

.filter-options label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  user-select: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease;
  font-size: 13px;
  color: var(--text);
  background: var(--surface-soft);
  border: 1px solid var(--border);
}

.filter-options label:hover {
  background: var(--accent-soft);
  border-color: var(--border);
  transform: translateX(2px);
}

.filter-options input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--accent-strong);
}

.tutor-section {
  min-width: 0;
  width: 100%;
  padding: 0 12px 8px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
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
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.progress {
  text-align: right;
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
  margin-top: 0;
  align-self: flex-end;
}

.tutor-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  touch-action: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  max-height: none;
  width: 100%;
  overflow: visible;
}

.card-image {
  position: relative;
  display: block;
  width: 360px;
  height: 480px;
  border-radius: 20px;
  overflow: hidden;
  background: var(--surface-soft);
  padding: 0;
  box-shadow: var(--shadow-soft);
  transform: translateX(var(--swipe-offset, 0px)) rotate(var(--swipe-rotation, 0deg));
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
  will-change: transform;
  transform-origin: center center;
  flex-shrink: 0;
}

.swipe-image-wrapper {
  width: 100%;
  height: 100%;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--surface-soft);
}

.swipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.card-image.swiping-left .swipe-image-wrapper,
.card-image.swiping-right .swipe-image-wrapper {
  opacity: 0.4;
}

.swipe-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 92px;
  font-weight: 800;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  transform: scale(0.94);
  color: rgba(255, 255, 255, 0.95);
  background: rgba(15, 23, 42, 0.16);
}

.swipe-indicator span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  color: rgba(255, 255, 255, 0.95);
}

.swipe-indicator.dislike,
.swipe-indicator.like {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(15, 23, 42, 0.12);
}

.card-image.swiping-left .swipe-indicator.dislike,
.card-image.swiping-right .swipe-indicator.like {
  opacity: 1;
  transform: scale(1.02);
}

.card-image:hover {
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18);
  filter: saturate(1.05);
}

.swipe-image:hover {
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18);
  filter: saturate(1.05);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  margin-top: 8px;
}

.tutor-main-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.tutor-summary-row {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) auto;
  gap: 10px;
  align-items: center;
  width: 100%;
}

.tutor-summary-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 12px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
}

.tutor-summary-price {
  align-items: flex-end;
  justify-content: center;
}

.tutor-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.tutor-meta {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
}

.tutor-price {
  margin: 0;
  font-size: 14px;
  color: var(--text);
  font-weight: 700;
}

.bio-box {
  margin-top: 12px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 8px;
  padding: 10px;
}

.bio-box p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  display: inline-block;
  background: var(--accent-soft);
  color: var(--text);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid var(--border);
}

.card-rating-pill {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(25, 45, 75, 0.88);
  color: #fff;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  z-index: 3;
}

.card-rating-pill .rating-stars {
  display: flex;
  gap: 2px;
}

.card-rating-pill .star {
  font-size: 14px;
}

/* half/full star overlay for pill */
.card-rating-pill .star {
  position: relative;
  color: rgba(255, 255, 255, 0.35);
}
.card-rating-pill .star::before {
  content: '★';
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  overflow: hidden;
  color: #f59e0b;
}
.card-rating-pill .star.filled::before {
  width: 100%;
}
.card-rating-pill .star.half::before {
  width: 50%;
}

/* inline tutor-rating stars */
.tutor-rating .star {
  position: relative;
  color: #e5e7eb;
}
.tutor-rating .star::before {
  content: '★';
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  overflow: hidden;
  color: #f59e0b;
}
.tutor-rating .star.filled::before {
  width: 100%;
}
.tutor-rating .star.half::before {
  width: 50%;
}

.card-rating-pill .rating-value {
  color: #fff;
  font-size: 13px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 16px;
  position: relative;
  z-index: 2;
  width: 100%;
}

.btn-like,
.btn-dislike {
  width: 100px;
  height: 100px;
  min-width: 72px;
  min-height: 72px;
  border: none;
  border-radius: 999px;
  padding: 0;
  font-weight: 700;
  font-size: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.btn-like:hover,
.btn-dislike:hover {
  transform: translateY(-2px);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.btn-like {
  background: #22c55e;
  color: white;
  border: 1px solid rgba(34, 197, 94, 0.4);
  font-size: 36px;
}

.btn-like:hover {
  transform: translateY(-1px);
}

.btn-dislike {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-dislike:hover {
  transform: translateY(-1px);
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: #4b5563;
  font-size: 14px;
}

.empty-state p {
  margin: 0;
}

/* Legacy styles kept for compatibility */
.find-korks-page {
  display: none;
}

.find-korks-card {
  display: none;
}
</style>

<style>
.tt-section .tt-grid-wrap {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface-strong);
}

.tt-section .tt-grid {
  display: grid;
  grid-template-columns: 38px repeat(7, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--surface-soft);
}

.tt-section .tt-corner {
  background: transparent;
}

.tt-section .tt-day-h {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: var(--surface-strong);
  border-radius: 3px;
  padding: 2px 0;
}

.tt-section .tt-time-l {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 600;
  color: var(--muted);
  border-radius: 3px;
}

.tt-section .tt-c {
  border-radius: 3px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  min-height: 22px;
}

.tt-section .tt-c.on {
  background: var(--accent-strong);
  border-color: var(--accent-strong);
}

:root[data-theme='dark'] .tt-section .tt-grid-wrap,
:root[data-theme='dark'] .tt-section .tt-grid,
:root[data-theme='dark'] .tt-section .tt-day-h,
:root[data-theme='dark'] .tt-section .tt-time-l,
:root[data-theme='dark'] .tt-section .tt-c {
  transition:
    background-color var(--theme-transition-duration) var(--theme-transition-easing),
    color var(--theme-transition-duration) var(--theme-transition-easing),
    border-color var(--theme-transition-duration) var(--theme-transition-easing);
}
</style>
