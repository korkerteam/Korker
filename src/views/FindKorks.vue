<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({ subjects: [], levels: [], tags: [] }),
  },
})

const emit = defineEmits(['close', 'like-teacher'])
const router = useRouter()
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

function confirmMatches() {
  emit('close')
  router.push({ name: 'home' })
}

function closePage() {
  emit('close')
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="find-korks-page">
    <div class="find-korks-card">
      <div class="find-korks-header">
        <h2>Korker - Szukaj</h2>
        <button class="close-button" @click="closePage" type="button">×</button>
      </div>

      <p class="find-korks-description">
        Poniżej pokazujemy korepetytorów dopasowanych do wybranych filtrów.
      </p>

      <div
        class="selected-filters"
        v-if="filters.subjects.length || filters.levels.length || filters.tags.length"
      >
        <span v-if="filters.subjects.length">Przedmioty: {{ filters.subjects.join(', ') }}</span>
        <span v-if="filters.levels.length">Poziom: {{ filters.levels.join(', ') }}</span>
        <span v-if="filters.tags.length">Tagi: {{ filters.tags.join(', ') }}</span>
      </div>

      <div v-if="filteredTutors.length">
        <div class="tinder-card-wrap">
          <div class="tinder-card">
            <div class="tinder-card-header">
              <span>{{ currentIndex + 1 }} / {{ filteredTutors.length }}</span>
            </div>

            <div v-if="currentTutor" class="card-body">
              <img
                v-if="currentTutor.image"
                :src="currentTutor.image"
                :alt="currentTutor.name"
                class="teacher-photo"
              />
              <h3>{{ currentTutor.name }}</h3>
              <p>{{ currentTutor.subject }} • {{ currentTutor.level }}</p>
              <p class="teacher-bio">{{ currentTutor.bio }}</p>
              <div class="result-tags">
                <span v-for="tag in currentTutor.tags" :key="tag">{{ tag }}</span>
              </div>
            </div>

            <div class="actions">
              <button class="dislike-button" @click="handleDecision(false)" type="button">
                Nie pasuje
              </button>
              <button class="like-button" @click="handleDecision(true)" type="button">Lubię</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">Brak korepetytorów dla wybranych filtrów.</div>
    </div>
  </div>
</template>

<style scoped>
.find-korks-page {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
}

.find-korks-card {
  width: min(900px, 92vw);
  background: rgba(255, 255, 255, 0.94);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(6px);
}

.find-korks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.find-korks-header h2 {
  margin: 0;
  font-size: 28px;
  color: #1f2937;
}

.close-button {
  border: none;
  background: transparent;
  font-size: 28px;
  cursor: pointer;
  color: #4b5563;
}

.find-korks-description {
  margin: 0 0 12px;
  color: #4b5563;
  font-size: 16px;
}

.selected-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.selected-filters span {
  background: #eef2ff;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
}

.tinder-card-wrap {
  display: flex;
  justify-content: center;
}

.tinder-card {
  width: min(100%, 620px);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(248, 251, 255, 0.98) 0%, rgba(238, 242, 255, 0.95) 100%);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
  user-select: none;
}

.tinder-card-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  color: #4b5563;
  font-size: 14px;
}

.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.teacher-photo {
  width: 100%;
  max-width: 320px;
  height: 220px;
  object-fit: cover;
  border-radius: 18px;
  margin-bottom: 14px;
}

.card-body h3 {
  margin: 0 0 6px;
  font-size: 24px;
}

.card-body p {
  margin: 0 0 8px;
  color: #4b5563;
}

.teacher-bio {
  margin-bottom: 12px !important;
  line-height: 1.5;
  color: #374151;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.result-tags span {
  background: #dbeafe;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.actions button {
  min-width: 140px;
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 700;
}

.like-button {
  background: #22c55e;
  color: white;
}

.dislike-button {
  background: #ef4444;
  color: white;
}

.confirm-row {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.confirm-button {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  cursor: pointer;
  background: #4f75c7;
  color: white;
  font-weight: 700;
}

.empty-state {
  padding: 16px;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 12px;
}
</style>
