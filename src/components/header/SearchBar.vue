<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase.js'

const router = useRouter()

const query = ref('')
const isOpen = ref(false)
const results = ref([])
const loading = ref(false)
let searchTimeout = null

function getDisplayName(record) {
  return (
    record?.nickname ||
    [record?.name, record?.surname].filter(Boolean).join(' ').trim() ||
    'Nieznany'
  )
}

async function fetchUsers() {
  const value = query.value.trim()
  if (!value) {
    results.value = []
    isOpen.value = false
    return
  }

  loading.value = true
  const { data, error } = await supabase
    .from('users')
    .select('auth_id, nickname, name, surname, profile_picture')
    .or(`nickname.ilike.%${value}%,name.ilike.%${value}%`)
    .limit(5)

  loading.value = false

  if (error) {
    results.value = []
    return
  }

  results.value = data || []
  isOpen.value = true
}

function openResults() {
  isOpen.value = query.value.trim().length > 0
}

function closeResults() {
  window.setTimeout(() => {
    isOpen.value = false
  }, 120)
}

function clearQuery() {
  query.value = ''
  results.value = []
  isOpen.value = false
}

function goToResult(user) {
  const identifier = user.nickname || user.auth_id
  router.push('/user/' + identifier)
}

function onSubmit() {
  const value = query.value.trim()
  if (!value) return

  if (results.value[0]) {
    goToResult(results.value[0])
    return
  }

  const identifier = value
  router.push('/user/' + identifier)
}

watch(query, (value) => {
  if (!value.trim()) {
    results.value = []
    isOpen.value = false
    return
  }

  clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    fetchUsers()
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
        placeholder="Szukaj użytkowników..."
        aria-label="Szukaj użytkowników"
        maxlength="100"
        @input="openResults"
        @focus="openResults"
        @blur="closeResults"
      />
      <button v-if="query" class="clear-btn" type="button" @mousedown.prevent="clearQuery">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </label>
    <button class="submit-btn" type="submit">Szukaj</button>

    <div v-if="isOpen && (query.trim() || loading)" class="results-list" role="listbox">
      <div v-if="loading" class="result-loading">Szukanie...</div>
      <div v-else-if="results.length === 0" class="result-empty">Brak wyników</div>
      <template v-else>
        <button
          v-for="user in results"
          :key="user.auth_id"
          class="result-item"
          type="button"
          @mousedown.prevent="goToResult(user)"
        >
          <div class="result-avatar">
            <img
              v-if="user.profile_picture"
              :src="user.profile_picture"
              :alt="getDisplayName(user)"
              class="result-avatar-img"
            />
            <span v-else class="result-avatar-letter">{{
              (user.nickname || user.name || '?').charAt(0).toUpperCase()
            }}</span>
          </div>
          <div class="result-text">
            <span class="result-title">{{
              user.nickname || [user.name, user.surname].filter(Boolean).join(' ')
            }}</span>
            <span v-if="user.nickname && (user.name || user.surname)" class="result-description">{{
              [user.name, user.surname].filter(Boolean).join(' ')
            }}</span>
          </div>
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
  padding: 3px 9px;
  background: var(--surface-strong);
  border-radius: 999px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
}

.search-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--surface-soft);
  border-radius: 999px;
  flex: 1 1 auto;
}

.search-input .icon {
  color: var(--accent-strong);
}

.search-input input {
  border: none;
  outline: none;
  font-size: 0.8rem;
  padding: 6px 0;
  width: 100%;
  background: transparent;
  color: var(--text);
}
.search-input input::-webkit-search-cancel-button,
.search-input input::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}
.search-input input::-ms-clear,
.search-input input::-ms-reveal {
  display: none;
  width: 0;
  height: 0;
}
.search-input input[type='search']::-moz-search-clear-button {
  display: none;
}
.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background 0.15s,
    color 0.15s;
}
.clear-btn:hover {
  background: rgba(138, 180, 255, 0.16);
  color: var(--text);
}

.submit-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-hover));
  color: #ffffff;
  border: none;
  padding: 9px 14px;
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
  max-height: 320px;
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
  align-items: center;
  gap: 10px;
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 8px 12px;
  text-align: left;
  background: transparent;
  color: #0f172a;
}

.result-loading {
  color: #64748b;
  font-size: 0.9rem;
  justify-content: center;
}
.result-empty {
  color: #64748b;
  font-size: 0.9rem;
  text-align: center;
  padding: 16px 12px;
}

.result-item {
  cursor: pointer;
}

.result-item:hover {
  background: #f1f5f9;
}

.result-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
}

.result-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-avatar-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.result-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.result-title {
  font-size: 0.95rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-description {
  font-size: 0.8rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
