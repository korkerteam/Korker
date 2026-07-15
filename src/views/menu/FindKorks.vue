<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { supabase } from '@/lib/supabase.js'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({ subjects: [], levels: [], tags: [] }),
  },
  likedTeachers: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'like-teacher'])
const tutors = ref([])
const loading = ref(true)
const decisions = ref({})
const currentIndex = ref(0)
const selectedSubjects = ref([])
const selectedLevels = ref([])
const selectedTags = ref([])
const swipeStartX = ref(null)
const swipeOffsetX = ref(0)
const swipeRotation = ref(0)
const cardRef = ref(null)

const subjectOptions = ['Matematyka', 'Fizyka', 'Język polski', 'Angielski']
const levelOptions = ['Szkoła podstawowa', 'Liceum', 'Studia']
const tagOptions = ['Matura', 'Egzamin', 'Online', 'Na miejscu']

onMounted(async () => {
  const { data: rows, error } = await supabase
    .from('users')
    .select('name, surname, profile_picture, tutor_post')
    .eq('account_type', 'tutor')
    .not('tutor_post', 'is', null)

  if (!error && rows) {
    tutors.value = rows
      .filter((r) => r.tutor_post)
      .map((r) => {
        const tp = r.tutor_post
        return {
          name: [r.name, r.surname].filter(Boolean).join(' ') || 'Korepetytor',
          subject: tp.subject || '',
          level: tp.level || '',
          tags: tp.tags || [],
          image: tp.photo || r.profile_picture || null,
          bio: tp.description || '',
          price: tp.price || 50,
        }
      })
  }
  console.log('Wszyscy tutorzy:', tutors.value)
  loading.value = false
})

const filteredTutors = computed(() => {
  return tutors.value.filter((tutor) => {
    if (decisions.value[tutor.name]) {
      return false
    }

    const localSubjects =
      selectedSubjects.value.length > 0 ? selectedSubjects.value : props.filters.subjects
    const localLevels =
      selectedLevels.value.length > 0 ? selectedLevels.value : props.filters.levels
    const allSelectedTags = [...props.filters.tags, ...selectedTags.value]

    const matchesSubject = localSubjects.length === 0 || localSubjects.includes(tutor.subject)
    const matchesLevel = localLevels.length === 0 || localLevels.includes(tutor.level)
    const matchesTags =
      allSelectedTags.length === 0 || allSelectedTags.some((tag) => tutor.tags.includes(tag))

    return matchesSubject && matchesLevel && matchesTags
  })
})

const currentTutor = computed(() => filteredTutors.value[currentIndex.value] || null)

watch(
  () => props.filters,
  () => {
    currentIndex.value = 0
    resetSwipe()
  },
  { deep: true },
)

function resetSwipe() {
  swipeStartX.value = null
  swipeOffsetX.value = 0
  swipeRotation.value = 0
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

  if (Math.abs(delta) > 3) {
    event.preventDefault?.()
  }
}

function endSwipe(event) {
  if (swipeStartX.value === null) return

  // Release pointer capture
  if (cardRef.value && event.pointerId !== undefined) {
    cardRef.value.releasePointerCapture(event.pointerId)
  }

  const currentX = getSwipeClientX(event)
  const delta = currentX - swipeStartX.value

  if (delta < -80) {
    handleDecision(false)
  } else if (delta > 80) {
    handleDecision(true)
  } else {
    resetSwipe()
  }
}

function nextTutor() {
  resetSwipe()

  if (currentIndex.value < filteredTutors.value.length - 1) {
    currentIndex.value += 1
  } else {
    currentIndex.value = 0
  }
}

function likeTutor() {
  if (currentTutor.value) {
    decisions.value[currentTutor.value.name] = 'good'
    emit('like-teacher', currentTutor.value)
  }
  nextTick(() => console.log('Pozostali tutorzy:', filteredTutors.value))
}

function dislikeTutor() {
  if (currentTutor.value) {
    decisions.value[currentTutor.value.name] = 'bad'
  }
  nextTick(() => console.log('Pozostali tutorzy:', filteredTutors.value))
}

function handleDecision(isLiked) {
  if (isLiked) {
    likeTutor()
  } else {
    dislikeTutor()
  }
}

function toggleSelection(category, value) {
  const targetArray =
    category === 'subjects'
      ? selectedSubjects.value
      : category === 'levels'
        ? selectedLevels.value
        : selectedTags.value

  const index = targetArray.indexOf(value)
  if (index > -1) {
    targetArray.splice(index, 1)
  } else {
    targetArray.push(value)
  }
  currentIndex.value = 0
  resetSwipe()
}

function closePage() {
  emit('close')
}
</script>

<template>
  <div class="find-korks-panel">
    <div class="tutors-content">
      <div class="tutor-section">
        <div
          v-if="filteredTutors.length && currentTutor"
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
          <div class="card-image">
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

          <div class="card-info">
            <h3 class="tutor-name">{{ currentTutor.name }}</h3>
            <p class="tutor-meta">{{ currentTutor.subject }} • {{ currentTutor.level }}</p>
            <p class="tutor-price">{{ currentTutor.price }} zł/h</p>

            <div class="tags-list">
              <span v-for="tag in currentTutor.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="filteredTutors.length && currentTutor"
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

        <div v-else-if="!filteredTutors.length" class="empty-state-card">
          <h3>Brak nauczycieli</h3>
          <p>Nie ma wyników dla tych filtrów. Spróbuj zmienić tagi lub wybrać inne kryteria.</p>
        </div>
      </div>

      <div class="tags-filter-section">
        <div class="tags-filter-header">
          <h4>Filtry</h4>
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
</template>

<style scoped>
.find-korks-panel {
  width: 100%;
  max-width: 1280px;
  min-height: 0;
  max-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  gap: 0;

  border-radius: 16px;
  overflow: visible;
  margin: 0 auto;
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
  display: flex;
  flex-direction: row;
  gap: 24px;
  overflow: hidden;
  align-items: flex-start;
  justify-content: space-between;
}

.tutor-section {
  order: 0;
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 24px 0 24px 0;
  min-height: 0;
}

.empty-state-card {
  width: min(100%, 480px);
  max-width: 480px;
  padding: 28px;
  border-radius: 24px;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
  border: 1px solid rgba(79, 117, 199, 0.18);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
  text-align: center;
  box-sizing: border-box;
}

.empty-state-card h3 {
  margin: 0 0 10px;
  color: #123;
  font-size: 22px;
}

.empty-state-card p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
  font-size: 15px;
}

.tags-filter-section {
  order: 1;
  width: min(280px, 32%);
  min-width: 260px;
  max-height: calc(100vh - 270px);
  padding: 24px;
  border-radius: 28px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.08);
  margin-left: auto;
  align-self: flex-start;
  position: sticky;
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
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.filter-group h5 {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-options label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 16px;
  cursor: pointer;
  user-select: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease;
  font-size: 14px;
  color: #1f2937;
  background: #f8fbff;
  border: 1px solid rgba(79, 117, 199, 0.12);
}

.filter-options label:hover {
  background: rgba(79, 117, 199, 0.13);
  border-color: rgba(79, 117, 199, 0.2);
  transform: translateX(2px);
}

.filter-options input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #4f75c7;
}

.tutor-section {
  flex: 1;
  padding: 0 24px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: visible;
  align-items: center;
  justify-content: flex-start;
}

.progress {
  text-align: right;
  font-size: 12px;
  color: #4b5563;
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
  background: linear-gradient(135deg, rgba(248, 251, 255, 0.98) 0%, rgba(238, 242, 255, 0.95) 100%);
  border: 1px solid rgba(79, 117, 199, 0.12);
  border-radius: 24px;
  padding: 24px;
  flex: 1;
  height: 100%;
  max-height: 980px;
  width: min(100%, 400px);
  overflow: visible;
  margin: 0 auto;
}

.card-image {
  display: block;
  width: 100%;
  height: 460px;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  padding: 0;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  transform: translateX(var(--swipe-offset, 0px)) rotate(var(--swipe-rotation, 0deg));
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
  will-change: transform;
  transform-origin: center center;
}

.swipe-image-wrapper {
  width: 100%;
  height: 100%;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 0;
  border: none;
  box-shadow: none;
  display: block;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  pointer-events: auto;
  cursor: pointer;
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

.tutor-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.tutor-meta {
  margin: 0;
  font-size: 12px;
  color: #4b5563;
  font-weight: 500;
}

.tutor-price {
  margin: 2px 0 0;
  font-size: 14px;
  color: #1f2937;
  font-weight: 700;
}

.bio-box {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(79, 117, 199, 0.1);
  border-left: 3px solid #4f75c7;
  border-radius: 8px;
  padding: 10px;
}

.bio-box p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #374151;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  display: inline-block;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #0c4a6e;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid rgba(79, 117, 199, 0.2);
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 200px;
  margin-top: 16px;
  position: relative;
  z-index: 2;
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
