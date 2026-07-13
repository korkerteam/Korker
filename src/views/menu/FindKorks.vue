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

const tutors = [
  {
    name: 'Anna Kowalska',
    subject: 'Matematyka',
    level: 'Liceum',
    tags: ['Matura', 'Online'],
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
    bio: 'Pomagam przygotować się do matury z matematyki w przyjazny sposób.',
  },
  {
    name: 'Piotr Nowak',
    subject: 'Fizyka',
    level: 'Studia',
    tags: ['Egzamin', 'Na miejscu'],
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
    bio: 'Skupię się na zrozumieniu pojęć i praktycznych zadaniach.',
  },
  {
    name: 'Marta Wiśniewska',
    subject: 'Język polski',
    level: 'Szkoła podstawowa',
    tags: ['Online'],
    image:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=500&q=80',
    bio: 'Łączę naukę z ciekawymi ćwiczeniami i czytaniem lektur.',
  },
  {
    name: 'Jakub Zieliński',
    subject: 'Angielski',
    level: 'Liceum',
    tags: ['Matura', 'Na miejscu'],
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80',
    bio: 'Pomagam budować pewność siebie w mówieniu i rozumieniu tekstów.',
  },
  {
    name: 'Katarzyna Sobczak',
    subject: 'Biologia',
    level: 'Liceum',
    tags: ['Online', 'Matura'],
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80',
    bio: 'Przygotowuję do egzaminów i tłumaczę trudne tematy obrazowo.',
  },
  {
    name: 'Maciej Płaczek',
    subject: 'Informatyka',
    level: 'Studia',
    tags: ['Programowanie', 'Online'],
    image:
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=500&q=80',
    bio: 'Uczę logicznego myślenia i pracy z kodem od podstaw.',
  },
  {
    name: 'Natalia Wójcik',
    subject: 'Chemia',
    level: 'Liceum',
    tags: ['Matura', 'Na miejscu'],
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
    bio: 'Wyjaśniam chemię krok po kroku i uczę skutecznie powtarzać materiał.',
  },
  {
    name: 'Oliwier Kaczmarek',
    subject: 'Historia',
    level: 'Szkoła podstawowa',
    tags: ['Online', 'Egzamin'],
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80',
    bio: 'Przygotowuję do sprawdzianów i uczę historii w ciekawy sposób.',
  },
  {
    name: 'Patrycja Marek',
    subject: 'Geografia',
    level: 'Liceum',
    tags: ['Matura', 'Online'],
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
    bio: 'Pomagam zapamiętywać mapy, pojęcia i schematy bez stresu.',
  },
  {
    name: 'Dominik Lis',
    subject: 'Matematyka',
    level: 'Szkoła podstawowa',
    tags: ['Online', 'Egzamin'],
    bio: 'Uczę matematyki spokojnie i krok po kroku.',
  },
  {
    name: 'Alicja Duda',
    subject: 'Angielski',
    level: 'Liceum',
    tags: ['Matura', 'Na miejscu'],
    bio: 'Pomagam poprawić słownictwo i komunikację.',
  },
  {
    name: 'Tomasz Krawczyk',
    subject: 'Fizyka',
    level: 'Liceum',
    tags: ['Egzamin', 'Online'],
    bio: 'Wytłumaczę trudne zagadnienia prostym językiem.',
  },
  {
    name: 'Ewa Nowak',
    subject: 'Biologia',
    level: 'Studia',
    tags: ['Online', 'Matura'],
    bio: 'Skupię się na nauce z materiałów i praktycznych przykładów.',
  },
  {
    name: 'Marcin Zieliński',
    subject: 'Informatyka',
    level: 'Liceum',
    tags: ['Programowanie', 'Na miejscu'],
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
    bio: 'Uczę poprawnego pisania i wyrażania myśli w prosty sposób.',
  },
  {
    name: 'Maja Kwiecień',
    subject: 'Chemia',
    level: 'Studia',
    tags: ['Online', 'Egzamin'],
    bio: 'Przygotowuję do egzaminów i wyjaśniam trudne reakcje chemiczne.',
  },
  {
    name: 'Rafał Szymański',
    subject: 'Chemia',
    level: 'Liceum',
    tags: ['Matura', 'Na miejscu'],
    bio: 'Pomagam zrozumieć chemię od podstaw do poziomu maturalnego.',
  },
  {
    name: 'Joanna Kozłowska',
    subject: 'Historia',
    level: 'Liceum',
    tags: ['Matura', 'Online'],
    bio: 'Uczę historii w uporządkowany sposób i z naciskiem na daty.',
  },
  {
    name: 'Kamil Baran',
    subject: 'Historia',
    level: 'Studia',
    tags: ['Egzamin', 'Na miejscu'],
    bio: 'Pomagam zrozumieć kontekst historyczny i przygotować się do sprawdzianów.',
  },
  {
    name: 'Sylwia Pawlak',
    subject: 'Geografia',
    level: 'Szkoła podstawowa',
    tags: ['Online', 'Egzamin'],
    bio: 'Łączę naukę geografii z prostymi schematami i ćwiczeniami.',
  },
  {
    name: 'Filip Jankowski',
    subject: 'Geografia',
    level: 'Studia',
    tags: ['Matura', 'Na miejscu'],
    bio: 'Pomagam zrozumieć zjawiska geograficzne i przygotować się do testów.',
  },
]

const filteredTutors = computed(() => {
  return tutors.filter((tutor) => {
    const matchesSubject =
      props.filters.subjects.length === 0 || props.filters.subjects.includes(tutor.subject)
    const matchesLevel =
      props.filters.levels.length === 0 || props.filters.levels.includes(tutor.level)
    const matchesTags =
      props.filters.tags.length === 0 || props.filters.tags.some((tag) => tutor.tags.includes(tag))

    return matchesSubject && matchesLevel && matchesTags
  })
})

const currentTutor = computed(() => filteredTutors.value[currentIndex.value] || null)

watch(
  () => props.filters,
  () => {
    currentIndex.value = 0
  },
  { deep: true },
)

function nextTutor() {
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
      <div class="progress">{{ currentIndex + 1 }} / {{ filteredTutors.length }}</div>

      <div v-if="currentTutor" class="tutor-card">
        <div class="card-image">
          <img v-if="currentTutor.image" :src="currentTutor.image" :alt="currentTutor.name" />
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

    <div v-else class="empty-state">
      <p>Brak korepetytorów dla wybranych filtrów.</p>
    </div>
  </div>
</template>

<style scoped>
.find-korks-panel {
  border: 1.5px solid var(--primary-color);
  width: 700px;
  max-height: 700px;
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
  padding: 16px;
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
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 14px;
  background: linear-gradient(135deg, rgba(248, 251, 255, 0.98) 0%, rgba(238, 242, 255, 0.95) 100%);
  border: 1px solid rgba(79, 117, 199, 0.12);
  border-radius: 12px;
  padding: 12px;
  align-items: start;
  flex: 1;
}

.card-image {
  display: flex;
  justify-content: center;
}

.card-image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(79, 117, 199, 0.1);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.tutor-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.tutor-meta {
  margin: 0;
  font-size: 13px;
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
  gap: 6px;
}

.tag {
  display: inline-block;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #0c4a6e;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(79, 117, 199, 0.2);
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.btn-like,
.btn-dislike {
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 12px;
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
