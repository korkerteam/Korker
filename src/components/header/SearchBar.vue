<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase.js'

const emit = defineEmits(['select-teacher'])
const router = useRouter()

const query = ref('')
const isOpen = ref(false)
const results = ref([])
const loading = ref(false)
let searchTimeout = null

function getDisplayName(record) {
  return [record?.name, record?.surname].filter(Boolean).join(' ').trim()
}

function isTeacherRecord(record) {
  const accountType = `${record?.account_type || ''}`.toLowerCase()
  return (
    accountType.includes('teacher') ||
    accountType.includes('tutor') ||
    accountType.includes('nauczyciel')
  )
}

async function fetchTeachers() {
  const value = query.value.trim()
  if (!value) {
    results.value = []
    isOpen.value = false
    return
  }

  loading.value = true
  const { data, error } = await supabase
    .from('users')
    .select('id, name, surname, location, account_type, profile_picture')
    .order('name', { ascending: true })

  loading.value = false

  if (error) {
    results.value = []
    return
  }

  const needle = value.toLowerCase()
  const matches = (data || [])
    .filter(isTeacherRecord)
    .filter((teacher) => {
      const haystack = [getDisplayName(teacher), teacher?.location, teacher?.account_type]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(needle)
    })
    .slice(0, 8)

  results.value = matches
  isOpen.value = matches.length > 0
}

function openResults() {
  isOpen.value = query.value.trim().length > 0
}

function closeResults() {
  window.setTimeout(() => {
    isOpen.value = false
  }, 120)
}

function goToResult(teacher) {
  emit('select-teacher', teacher)
  query.value = getDisplayName(teacher)
  isOpen.value = false
  router.push({ path: '/', query: { teacher: teacher.id } })
}

function onSubmit() {
  const value = query.value.trim()
  if (!value) return

  if (results.value[0]) {
    goToResult(results.value[0])
    return
  }

  router.push({ path: '/' })
}

watch(query, (value) => {
  if (!value.trim()) {
    results.value = []
    isOpen.value = false
    return
  }

  clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    fetchTeachers()
  }, 250)
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
})
</script>

<template>
  <form class="searchbar" role="search" @submit.prevent="onSubmit">
    <label class="search-input" aria-hidden>
      <svg
        class="icon"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11 19a8 8 0 1 1 5.293-14.293A8 8 0 0 1 11 19z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M21 21l-4.35-4.35"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <input
        v-model="query"
        type="search"
        name="q"
        placeholder="Szukaj nauczycieli..."
        aria-label="Szukaj nauczycieli"
        @input="openResults"
        @focus="openResults"
        @blur="closeResults"
      />
    </label>
    <button class="submit-btn" type="submit">Szukaj</button>

    <div v-if="isOpen && (results.length || loading)" class="results-list" role="listbox">
      <div v-if="loading" class="result-loading">Szukam nauczycieli...</div>
      <template v-else>
        <button
          v-for="teacher in results"
          :key="teacher.id"
          class="result-item"
          type="button"
          @mousedown.prevent="goToResult(teacher)"
        >
          <span class="result-title">{{ getDisplayName(teacher) }}</span>
          <span class="result-description">{{ teacher.location || 'Brak lokalizacji' }}</span>
        </button>
      </template>
    </div>
  </form>
</template>

<style scoped>
.searchbar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 999px;
  border: 1px solid rgba(79, 117, 199, 0.18);
  box-shadow: 0 18px 42px rgba(79, 117, 199, 0.08);
}

.search-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  flex: 1 1 auto;
}

.search-input .icon {
  color: var(--accent-strong);
}

.search-input input {
  border: none;
  outline: none;
  font-size: 0.95rem;
  padding: 6px 0;
  width: 100%;
  background: transparent;
}

.submit-btn {
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #ffffff;
  border: none;
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(79, 117, 199, 0.18);
}

.submit-btn:hover {
  box-shadow: 0 16px 36px rgba(79, 117, 199, 0.22);
  transform: translateY(-1px);
}

.results-list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(79, 117, 199, 0.16);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
}

.result-loading,
.result-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 10px 12px;
  text-align: left;
  background: transparent;
  color: #0f172a;
}

.result-loading {
  color: #64748b;
  font-size: 0.9rem;
}

.result-item {
  cursor: pointer;
}

.result-item:hover {
  background: #f1f5f9;
}

.result-title {
  font-size: 0.95rem;
  font-weight: 700;
}

.result-description {
  font-size: 0.8rem;
  color: #64748b;
}

@media (max-width: 900px) {
  .searchbar {
    padding: 8px 10px;
  }

  .submit-btn {
    padding: 10px 14px;
  }
}
</style>
