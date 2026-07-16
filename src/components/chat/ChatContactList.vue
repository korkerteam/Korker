<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  conversations: Array,
  searchResults: Array,
  searchLoading: Boolean,
})
const emit = defineEmits(['openChat', 'close', 'search', 'clearSearch'])

const showSearch = ref(false)
const searchQuery = ref('')

watch(searchQuery, (val) => {
  if (showSearch.value) {
    emit('search', val)
    if (!val.trim()) emit('clearSearch')
  }
})

function openSearch() {
  showSearch.value = true
  searchQuery.value = ''
  emit('search', '')
}

function closeSearch() {
  showSearch.value = false
  searchQuery.value = ''
  emit('clearSearch')
}

function selectUser(userId) {
  showSearch.value = false
  searchQuery.value = ''
  emit('clearSearch')
  emit('openChat', userId)
}
</script>

<template>
  <div class="list-header">
    <h2 class="list-header-title">Wiadomości</h2>
    <div class="header-actions">
      <button class="icon-btn" @click="openSearch" title="Nowa konwersacja">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
        </svg>
      </button>
      <button class="icon-btn" @click="$emit('close')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  </div>

  <div v-if="showSearch" class="search-view">
    <div class="search-input-wrap">
      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          fill="#9ca3af"
        />
      </svg>
      <input
        v-model="searchQuery"
        class="search-input"
        placeholder="Szukaj użytkownika..."
        autofocus
      />
      <button v-if="searchQuery" class="icon-btn-small" @click="closeSearch">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>

    <div class="search-results">
      <div v-if="searchLoading" class="empty-state">Szukanie...</div>
      <div v-else-if="searchQuery && searchResults.length === 0" class="empty-state">
        Brak wyników
      </div>
      <div v-else-if="!searchQuery" class="empty-state">Wpisz nazwę użytkownika</div>
      <button
        v-for="r in searchResults"
        :key="r.userId"
        class="contact-item"
        @click="selectUser(r.userId)"
      >
        <div class="contact-item-left">
          <router-link
            :to="'/user/' + (r.nickname || r.userId)"
            class="contact-item-avatar-link"
            @click.stop
          >
            <div class="contact-item-avatar" :style="{ background: r.avatarColor }">
              <img
                v-if="r.profilePicture"
                :src="r.profilePicture"
                :alt="r.name"
                class="avatar-img"
              />
              <span v-else>{{ r.name?.charAt(0) || '?' }}</span>
            </div>
          </router-link>
          <div class="contact-item-info">
            <router-link
              :to="'/user/' + (r.nickname || r.userId)"
              class="contact-item-name-link"
              @click.stop
            >
              <span class="contact-item-name">{{ r.name }}</span>
            </router-link>
          </div>
        </div>
      </button>
    </div>
  </div>

  <div v-else class="contact-list">
    <div v-if="conversations.length === 0" class="empty-state">Brak wiadomości</div>
    <button
      v-for="c in conversations"
      :key="c.userId"
      class="contact-item"
      @click="$emit('openChat', c.userId)"
    >
      <div class="contact-item-left">
        <router-link :to="'/user/' + c.userId" class="contact-item-avatar-link" @click.stop>
          <div class="contact-item-avatar" :style="{ background: c.avatarColor }">
            <img v-if="c.profilePicture" :src="c.profilePicture" :alt="c.name" class="avatar-img" />
            <span v-else>{{ c.name?.charAt(0) || '?' }}</span>
          </div>
        </router-link>
        <div class="contact-item-info">
          <router-link
            :to="'/user/' + (c.nickname || c.userId)"
            class="contact-item-name-link"
            @click.stop
          >
            <span class="contact-item-name">{{ c.name }}</span>
          </router-link>
          <span class="contact-item-last">{{ c.lastMessage || '' }}</span>
        </div>
      </div>
      <div class="contact-item-right">
        <span class="contact-time">{{ c.lastTimeLabel }}</span>
        <span v-if="c.unread > 0" class="unread-badge">{{ c.unread }}</span>
      </div>
    </button>
  </div>
</template>

<style scoped>
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--accent);
  color: #fff;
  flex-shrink: 0;
  min-height: 64px;
}
.list-header-title {
  font-family: 'Horizon', sans-serif;
  font-size: 20px;
  font-weight: 400;
  margin: 0;
  letter-spacing: 0.5px;
}
.header-actions {
  display: flex;
  gap: 8px;
}
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.icon-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}
.icon-btn:active {
  transform: scale(0.92);
}
.icon-btn-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.icon-btn-small:hover {
  background: rgba(138, 180, 255, 0.16);
}
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--muted);
  font-size: 16px;
  padding: 40px 20px;
}
.search-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin: 8px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  flex-shrink: 0;
}
.search-icon {
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: var(--text);
  outline: none;
  font-family: inherit;
}
.search-input::placeholder {
  color: var(--muted);
}
.search-results {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.contact-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}
.contact-list::-webkit-scrollbar,
.search-results::-webkit-scrollbar {
  width: 5px;
}
.contact-list::-webkit-scrollbar-track,
.search-results::-webkit-scrollbar-track {
  background: transparent;
}
.contact-list::-webkit-scrollbar-thumb,
.search-results::-webkit-scrollbar-thumb {
  background: #d1dcee;
  border-radius: 4px;
}
.contact-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border);
  color: var(--text);
}
.contact-item:hover {
  background: rgba(138, 180, 255, 0.12);
}
.contact-item:active {
  background: rgba(138, 180, 255, 0.2);
}
.contact-item-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}
.contact-item-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f8fafc;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.contact-item-avatar-link {
  display: block;
  line-height: 0;
  text-decoration: none;
  border-radius: 50%;
  flex-shrink: 0;
}
.contact-item-name-link {
  text-decoration: none;
  color: inherit;
}
.contact-item-name-link:hover {
  text-decoration: underline;
}
.contact-item-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.contact-item-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.contact-item-last {
  font-size: 15px;
  color: var(--muted);
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 1px;
}
.contact-item-right {
  flex-shrink: 0;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.contact-time {
  font-size: 13px;
  color: var(--muted);
  white-space: nowrap;
}
.unread-badge {
  background: var(--primary-color);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}
</style>
