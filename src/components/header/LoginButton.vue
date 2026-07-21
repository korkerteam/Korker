<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'

const emit = defineEmits(['login'])

const route = useRoute()
const router = useRouter()
const { isAuthenticated, profileData, profileName, profileInitial, signOut } = useAuth()

function goToOwnProfile() {
  const nickname = profileData.value?.nickname || profileName.value
  router.push('/user/' + encodeURIComponent(nickname))
}
</script>

<template>
  <div v-if="isAuthenticated" class="user-menu">
    <button
      v-if="profileData?.profile_picture"
      class="avatar-button"
      type="button"
      @click="goToOwnProfile"
      :aria-label="`Przejdź do profilu ${profileName}`"
    >
      <img :src="profileData.profile_picture" class="avatar" />
    </button>
    <button v-else class="user-avatar click" type="button" @click="goToOwnProfile">
      {{ profileInitial }}
    </button>
    <button
      @click="goToOwnProfile"
      class="user-email"
      type="button"
      :aria-label="`Profil: ${profileName}`"
    >
      {{ profileName }}
    </button>
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
  gap: 10px;
  padding: 10px 16px;
  border-radius: 999px;
  background-color: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
}

.user-avatar,
.avatar-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--border);
  padding: 0;
  background: var(--surface-strong);
  color: var(--text-strong);
  font-size: 0.95rem;
  font-weight: 700;
  font-family: Inter, system-ui, sans-serif;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.user-avatar {
  background-color: var(--accent);
  color: #ffffff;
}

.avatar-button:hover,
.user-avatar:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14);
}

.avatar-button:active,
.user-avatar:active {
  transform: scale(0.96);
}

.avatar-button:focus-visible,
.user-avatar:focus-visible {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79, 117, 199, 0.16);
}

.user-email {
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text);
  max-width: 140px;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: none;
  background: transparent;
  padding: 8px 12px 8px 0;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
}

.user-email:hover {
  background: rgba(79, 117, 199, 0.08);
}

.user-email:active {
  background: rgba(79, 117, 199, 0.12);
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--muted);
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s,
    transform 0.18s;
}

.logout-btn:hover {
  background: rgba(79, 117, 199, 0.16);
  color: var(--text);
  transform: translateY(-1px);
}

.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 22px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #ffffff;
  font-family: Inter, system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 14px 36px rgba(79, 117, 199, 0.16);
  white-space: nowrap;
}

.login-btn:hover {
  box-shadow: 0 18px 44px rgba(79, 117, 199, 0.22);
}

.login-btn:active {
  box-shadow: 0 8px 20px rgba(79, 117, 199, 0.16);
}

.login-icon {
  flex-shrink: 0;
}

.click {
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

@media (max-width: 768px) {
  .user-menu {
    padding: 4px;
    flex-shrink: 0;
    gap: 2px;
    border-radius: 999px;
    margin: 0 0 0 -2px;
  }

  .user-email {
    display: none;
  }

  .user-avatar,
  .avatar-button {
    width: 30px;
    height: 30px;
  }

  .logout-btn {
    width: 26px;
    height: 26px;
  }

  .login-btn {
    width: 40px;
    height: 40px;
    padding: 0;
    min-width: 40px;
    justify-content: center;
    border-radius: 50%;
  }

  .login-btn span {
    display: none;
  }
}
</style>
