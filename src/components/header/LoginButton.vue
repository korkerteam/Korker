<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { toggleProfile } from '../../composables/menuToggle'

const emit = defineEmits(['login'])

const route = useRoute()
const router = useRouter()
const { isAuthenticated, profileData, profileName, profileInitial, signOut } = useAuth()

function handleProfileClick() {
  toggleProfile(route, router)
}
</script>

<template>
  <div v-if="isAuthenticated" class="user-menu">
    <img v-if="profileData?.profile_picture" :src="profileData.profile_picture" class="avatar" />
    <span v-else @click="handleProfileClick" class="user-avatar click">{{ profileInitial }}</span>
    <span @click="handleProfileClick" class="user-email click">{{ profileName }}</span>
    <button class="logout-btn" type="button" @click="signOut" title="Wyloguj się">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  </div>
  <button v-else class="login-btn" type="button" @click="$emit('login')">
    <svg class="login-icon" viewBox="0 0 24 24" width="18" height="18" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6" />
      <path
        d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    </svg>
    <span>Zaloguj się</span>
  </button>
</template>

<style scoped>
.user-menu {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px 6px 6px;
  border-radius: 999px;
  background-color: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  font-family: Inter, system-ui, sans-serif;
  flex-shrink: 0;
}

.user-email {
  font-family: Inter, system-ui, sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #999;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.logout-btn:hover {
  background: #f0f0f0;
  color: #d32f2f;
}

.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 999px;
  background-color: var(--primary-color);
  color: #ffffff;
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(79, 117, 199, 0.18);
  white-space: nowrap;
}

.login-btn:hover {
  box-shadow: 0 14px 36px rgba(79, 117, 199, 0.22);
  background-color: var(--primary-color-hover);
}

.login-btn:active {
  box-shadow: 0 4px 12px rgba(79, 117, 199, 0.18);
}

.login-icon {
  flex-shrink: 0;
}

.click {
  cursor: pointer;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #eef2ff;
  display: block;
}
</style>
