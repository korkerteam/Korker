<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({ subjects: [], levels: [], tags: [] }),
  },
})

const emit = defineEmits(['close', 'like-teacher'])
const currentIndex = ref(0)
const selectedSubjects = ref([])
const selectedLevels = ref([])
const selectedTags = ref([])
const swipeStartX = ref(null)
const swipeOffsetX = ref(0)
const swipeRotation = ref(0)

const subjectOptions = ['Matematyka', 'Fizyka', 'Język polski', 'Angielski']
const levelOptions = ['Szkoła podstawowa', 'Liceum', 'Studia']
const tagOptions = ['Matura', 'Egzamin', 'Online', 'Na miejscu']

const tutors = [
  {
    name: 'Anna Kowalska',
    subject: 'Matematyka',
    level: 'Liceum',
    tags: ['Matura', 'Online'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Pomagam przygotować się do matury z matematyki w przyjazny sposób.',
  },
  {
    name: 'Piotr Nowak',
    subject: 'Fizyka',
    level: 'Studia',
    tags: ['Egzamin', 'Na miejscu'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Skupię się na zrozumieniu pojęć i praktycznych zadaniach.',
  },
  {
    name: 'Marta Wiśniewska',
    subject: 'Język polski',
    level: 'Szkoła podstawowa',
    tags: ['Online'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Łączę naukę z ciekawymi ćwiczeniami i czytaniem lektur.',
  },
  {
    name: 'Jakub Zieliński',
    subject: 'Angielski',
    level: 'Liceum',
    tags: ['Matura', 'Na miejscu'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Pomagam budować pewność siebie w mówieniu i rozumieniu tekstów.',
  },
  {
    name: 'Katarzyna Sobczak',
    subject: 'Biologia',
    level: 'Liceum',
    tags: ['Online', 'Matura'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Przygotowuję do egzaminów i tłumaczę trudne tematy obrazowo.',
  },
  {
    name: 'Maciej Płaczek',
    subject: 'Informatyka',
    level: 'Studia',
    tags: ['Programowanie', 'Online'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Uczę logicznego myślenia i pracy z kodem od podstaw.',
  },
  {
    name: 'Natalia Wójcik',
    subject: 'Chemia',
    level: 'Liceum',
    tags: ['Matura', 'Na miejscu'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Wyjaśniam chemię krok po kroku i uczę skutecznie powtarzać materiał.',
  },
  {
    name: 'Oliwier Kaczmarek',
    subject: 'Historia',
    level: 'Szkoła podstawowa',
    tags: ['Online', 'Egzamin'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Przygotowuję do sprawdzianów i uczę historii w ciekawy sposób.',
  },
  {
    name: 'Patrycja Marek',
    subject: 'Geografia',
    level: 'Liceum',
    tags: ['Matura', 'Online'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Pomagam zapamiętywać mapy, pojęcia i schematy bez stresu.',
  },
  {
    name: 'Dominik Lis',
    subject: 'Matematyka',
    level: 'Szkoła podstawowa',
    tags: ['Online', 'Egzamin'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Uczę matematyki spokojnie i krok po kroku.',
  },
  {
    name: 'Alicja Duda',
    subject: 'Angielski',
    level: 'Liceum',
    tags: ['Matura', 'Na miejscu'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Pomagam poprawić słownictwo i komunikację.',
  },
  {
    name: 'Tomasz Krawczyk',
    subject: 'Fizyka',
    level: 'Liceum',
    tags: ['Egzamin', 'Online'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Wytłumaczę trudne zagadnienia prostym językiem.',
  },
  {
    name: 'Ewa Nowak',
    subject: 'Biologia',
    level: 'Studia',
    tags: ['Online', 'Matura'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Skupię się na nauce z materiałów i praktycznych przykładów.',
  },
  {
    name: 'Marcin Zieliński',
    subject: 'Informatyka',
    level: 'Liceum',
    tags: ['Programowanie', 'Na miejscu'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Pomagam zrozumieć podstawy programowania i algorytmiki.',
  },
  {
    name: 'Karolina Nowak',
    subject: 'Język polski',
    level: 'Liceum',
    tags: ['Matura', 'Online'],
    bio: 'Pomagam rozwijać czytanie ze zrozumieniem i wypracowania.',
  },
  {
    name: 'Bartosz Wróbel',
    subject: 'Język polski',
    level: 'Szkoła podstawowa',
    tags: ['Egzamin', 'Na miejscu'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Uczę poprawnego pisania i wyrażania myśli w prosty sposób.',
  },
  {
    name: 'Maja Kwiecień',
    subject: 'Chemia',
    level: 'Studia',
    tags: ['Online', 'Egzamin'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Przygotowuję do egzaminów i wyjaśniam trudne reakcje chemiczne.',
  },
  {
    name: 'Rafał Szymański',
    subject: 'Chemia',
    level: 'Liceum',
    tags: ['Matura', 'Na miejscu'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Pomagam zrozumieć chemię od podstaw do poziomu maturalnego.',
  },
  {
    name: 'Joanna Kozłowska',
    subject: 'Historia',
    level: 'Liceum',
    tags: ['Matura', 'Online'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Uczę historii w uporządkowany sposób i z naciskiem na daty.',
  },
  {
    name: 'Kamil Baran',
    subject: 'Historia',
    level: 'Studia',
    tags: ['Egzamin', 'Na miejscu'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Pomagam zrozumieć kontekst historyczny i przygotować się do sprawdzianów.',
  },
  {
    name: 'Sylwia Pawlak',
    subject: 'Geografia',
    level: 'Szkoła podstawowa',
    tags: ['Online', 'Egzamin'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Łączę naukę geografii z prostymi schematami i ćwiczeniami.',
  },
  {
    name: 'Filip Jankowski',
    subject: 'Geografia',
    level: 'Studia',
    tags: ['Matura', 'Na miejscu'],
    image: 'https://media1.tenor.com/m/CZytKmg1_AEAAAAd/troll-face-internet.gif',
    bio: 'Pomagam zrozumieć zjawiska geograficzne i przygotować się do testów.',
  },
]

const filteredTutors = computed(() => {
  return tutors.filter((tutor) => {
    // Local filters take precedence over global filters
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
  swipeStartX.value = getSwipeClientX(event)
  swipeOffsetX.value = 0
  swipeRotation.value = 0
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
    emit('like-teacher', currentTutor.value)
  }
  nextTutor()
}

function dislikeTutor() {
  nextTutor()
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
    <div class="find-korks-header">
      <div>
        <h3>Szukaj Korepetytora</h3>
        <p class="subtitle">Przeglądaj dostępnych nauczycieli</p>
      </div>
      <button class="close-button" @click="closePage" type="button">×</button>
    </div>

    <div v-if="filteredTutors.length" class="tutors-content">
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

      <div class="tutor-section">
        <div class="progress">{{ currentIndex + 1 }} / {{ filteredTutors.length }}</div>

        <div v-if="currentTutor" class="tutor-card">
          <div
            class="card-image"
            @pointerdown="startSwipe"
            @pointermove="moveSwipe"
            @pointerup="endSwipe"
            @pointercancel="endSwipe"
          >
            <div v-if="currentTutor.image" class="swipe-image-wrapper">
              <img
                class="swipe-image"
                :src="currentTutor.image"
                :alt="currentTutor.name"
                :style="{
                  '--swipe-offset': `${swipeOffsetX}px`,
                  '--swipe-rotation': `${swipeRotation}deg`,
                }"
              />
            </div>
          </div>

          <div class="card-info">
            <h3 class="tutor-name">{{ currentTutor.name }}</h3>
            <p class="tutor-meta">{{ currentTutor.subject }} • {{ currentTutor.level }}</p>

            <div class="tags-list">
              <span v-for="tag in currentTutor.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>

            <div class="actions">
              <button class="btn-dislike" @click="handleDecision(false)">Nie pasuje</button>
              <button class="btn-like" @click="handleDecision(true)">Lubię</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Brak korepetytorów dla wybranych filtrów.</p>
    </div>
  </div>
</template>

<style scoped>
.find-korks-panel {
  border: 1.5px solid var(--primary-color);
  width: 1200px;
  height: 700px;
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
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

.close-button {
  border: none;
  background: transparent;
  font-size: 28px;
  cursor: pointer;
  color: #9ca3af;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1f2937;
}

.tutors-content {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: row;
  gap: 0;
  overflow: hidden;
}

.tags-filter-section {
  width: 240px;
  padding: 16px;
  border-right: 1.5px solid rgba(79, 117, 199, 0.1);
  overflow-y: auto;
  background: linear-gradient(135deg, rgba(248, 251, 255, 0.4) 0%, rgba(238, 242, 255, 0.4) 100%);
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
  gap: 6px;
}

.filter-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  font-size: 13px;
  color: #374151;
}

.filter-options label:hover {
  background: rgba(79, 117, 199, 0.08);
}

.filter-options input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #4f75c7;
}

.tutor-section {
  flex: 1;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.progress {
  text-align: right;
  font-size: 12px;
  color: #4b5563;
  font-weight: 500;
}

.tutor-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(135deg, rgba(248, 251, 255, 0.98) 0%, rgba(238, 242, 255, 0.95) 100%);
  border: 1px solid rgba(79, 117, 199, 0.12);
  border-radius: 12px;
  padding: 14px;
  flex: 1;
  max-height: 550px;
  overflow-y: auto;
}

.card-image {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 280px;
  border-radius: 8px;
  overflow: hidden;
  touch-action: pan-y;
  user-select: none;
  padding: 6px 0;
}

.swipe-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.swipe-image {
  display: block;
  width: 40%;
  height: 320px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(79, 117, 199, 0.1);
  transform: translateX(var(--swipe-offset, 0px)) rotate(var(--swipe-rotation, 0deg));
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
  will-change: transform;
  transform-origin: center center;
  backface-visibility: hidden;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  -webkit-user-drag: none;
  user-select: none;
  pointer-events: auto;
  cursor: pointer;
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
  gap: 6px;
  margin-top: 4px;
}

.btn-like,
.btn-dislike {
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-weight: 600;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-like {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.btn-like:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(34, 197, 94, 0.2);
}

.btn-dislike {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-dislike:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
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
