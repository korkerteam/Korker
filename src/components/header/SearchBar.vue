<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase.js'

const router = useRouter()

const query = ref('')
const isOpen = ref(false)
const isSearchOpen = ref(false)
const results = ref([])
const loading = ref(false)
const desktopSearchInput = ref(null)
const mobileSearchInput = ref(null)
const isDesktop = ref(window.innerWidth > 768)
let searchTimeout = null

const handleResize = () => {
  isDesktop.value = window.innerWidth > 768
}

window.addEventListener('resize', handleResize)

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

function toggleSearch() {
  isSearchOpen.value = !isSearchOpen.value
  if (isSearchOpen.value) {
    window.setTimeout(() => {
      mobileSearchInput.value?.focus()
    }, 0)
  }
}

function closeSearch() {
  isSearchOpen.value = false
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
  closeSearch()
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
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <form class="searchbar" role="search" @submit.prevent="onSubmit">
    <!-- Desktop: Always show search input, hide button -->
    <div v-if="isDesktop" class="search-popup desktop-search" @click.stop>
      <label class="search-input" aria-label="Szukaj użytkowników">
        <svg
          class="icon"
          viewBox="0 0 24 24"
          width="14"
          height="14"
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
          ref="desktopSearchInput"
          v-model="query"
          type="search"
          name="q"
          placeholder="Szukaj"
          aria-label="Szukaj"
          maxlength="100"
          @input="openResults"
          @focus="openResults"
          @blur="closeResults"
        />
        <button v-if="query" class="clear-btn" type="button" @mousedown.prevent="clearQuery">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </label>

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
              <span
                v-if="user.nickname && (user.name || user.surname)"
                class="result-description"
                >{{ [user.name, user.surname].filter(Boolean).join(' ') }}</span
              >
            </div>
          </button>
        </template>
      </div>
    </div>

    <!-- Mobile: Show button to toggle search -->
    <button
      v-if="!isDesktop"
      class="search-trigger"
      type="button"
      aria-label="Szukaj użytkowników"
      @click="toggleSearch"
    >
      <svg
        class="icon"
        viewBox="0 0 24 24"
        width="14"
        height="14"
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
    </button>

    <div v-if="!isDesktop && isSearchOpen" class="search-popup" @click.stop>
      <label class="search-input" aria-label="Szukaj użytkowników">
        <svg
          class="icon"
          viewBox="0 0 24 24"
          width="14"
          height="14"
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
          ref="mobileSearchInput"
          v-model="query"
          type="search"
          name="q"
          placeholder="Szukaj"
          aria-label="Szukaj"
          maxlength="100"
          @input="openResults"
          @focus="openResults"
          @blur="closeResults"
        />
        <button v-if="query" class="clear-btn" type="button" @mousedown.prevent="clearQuery">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </label>

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
              <span
                v-if="user.nickname && (user.name || user.surname)"
                class="result-description"
                >{{ [user.name, user.surname].filter(Boolean).join(' ') }}</span
              >
            </div>
          </button>
        </template>
      </div>
    </div>
  </form>
</template>

<style scoped>
.searchbar {
  position: relative;
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  min-width: 0;
  max-width: 100%;
  margin: 0;
  padding: 0;
  z-index: 70;
  margin-left: 0;
}

@media (min-width: 769px) {
  .searchbar {
    flex: 1 1 auto;
    max-width: none;
    min-width: 200px;
  }
}

.search-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-hover));
  color: #fff;
  box-shadow: 0 8px 18px rgba(79, 117, 199, 0.18);
  cursor: pointer;
}

.search-popup {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: min(320px, 86vw);
  padding: 8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(79, 117, 199, 0.16);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.16);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 9999;
}

.search-popup.desktop-search {
  position: relative;
  width: auto;
  transform: none;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  gap: 0;
  z-index: auto;
  flex: 1;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  height: 36px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 999px;
  width: 100%;
  box-sizing: border-box;
  box-shadow: var(--shadow-soft);
  cursor: text;
}

.desktop-search .search-input {
  border-radius: 999px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  position: relative;
  width: 100%;
  height: 53px;
  margin-left: -108px;
  font-size: 20px;
}

.search-input .icon {
  color: var(--accent-strong);
  flex-shrink: 0;
}

.search-input input {
  border: none;
  outline: none;
  font-size: 0.8rem;
  padding: 0;
  width: 100%;
  height: 100%;
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

.results-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
  padding: 6px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(79, 117, 199, 0.16);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
}

.desktop-search .results-list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  margin: 0;
  border-radius: 14px;
  width: 100%;
  min-width: 300px;
  z-index: 9999;
  margin-left: -100px;
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

@media (max-width: 768px) {
  .searchbar {
    width: auto;
    min-width: auto;
    margin: 0;
    margin-right: 2px;
  }

  .search-trigger {
    width: 30px;
    height: 30px;
  }

  .search-popup {
    width: min(300px, calc(100vw - 24px));
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (max-width: 900px) {
  .searchbar {
    padding: 8px 10px;
  }
}
</style>
