<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { translateAuthError } from '@/utils/authErrors.js'

const LIMITS = { name: 30, surname: 30 }

const router = useRouter()

const emit = defineEmits(['close'])

const { signIn, signUp, authModalMode } = useAuth()

const isLogin = computed(() => authModalMode.value === 'login')
const email = ref('')
const password = ref('')
const name = ref('')
const surname = ref('')
const error = ref('')
const success = ref('')
const submitting = ref(false)

function toggleMode() {
  authModalMode.value = isLogin.value ? 'signup' : 'login'
  error.value = ''
  success.value = ''
}

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (!email.value || !password.value) {
    error.value = 'Wypełnij wszystkie pola'
    return
  }

  if (!isLogin.value && (!name.value || !surname.value)) {
    error.value = 'Wypełnij wszystkie pola'
    return
  }

  if (!isLogin.value && name.value.length > LIMITS.name) {
    error.value = `Imię może mieć maksymalnie ${LIMITS.name} znaków`
    return
  }
  if (!isLogin.value && surname.value.length > LIMITS.surname) {
    error.value = `Nazwisko może mieć maksymalnie ${LIMITS.surname} znaków`
    return
  }

  if (password.value.length < 6) {
    error.value = 'Hasło musi mieć co najmniej 6 znaków'
    return
  }

  submitting.value = true
  try {
    if (isLogin.value) {
      await signIn(email.value, password.value)
      emit('close')
      router.push('/')
    } else {
      const data = await signUp(email.value, password.value, {
        data: { name: name.value, surname: surname.value },
      })
      if (data?.session) {
        emit('close')
        router.push({ path: '/', query: { panel: 'profile' } })
      } else {
        success.value = 'Konto utworzone! Sprawdź email, aby potwierdzić rejestrację.'
      }
    }
  } catch (err) {
    error.value = translateAuthError(err.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card" :style="{ '--modal-w': isLogin ? '360px' : '460px' }">
      <button class="close-btn" @click="emit('close')" type="button">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <h2 class="modal-title">{{ isLogin ? 'Zaloguj się' : 'Zarejestruj się' }}</h2>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="twoj@email.pl"
            autocomplete="email"
            maxlength="254"
          />
        </div>

        <div v-show="!isLogin" class="field-row">
          <div class="field">
            <label for="name">Imię</label>
            <input
              id="name"
              v-model="name"
              type="text"
              placeholder="Jan"
              autocomplete="given-name"
              :maxlength="LIMITS.name"
            />
          </div>
          <div class="field">
            <label for="surname">Nazwisko</label>
            <input
              id="surname"
              v-model="surname"
              type="text"
              placeholder="Kowalski"
              autocomplete="family-name"
              :maxlength="LIMITS.surname"
            />
          </div>
        </div>

        <div class="field">
          <label for="password">Hasło</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••"
            autocomplete="current-password"
            maxlength="128"
          />
        </div>

        <p v-if="error" class="msg msg-error">{{ error }}</p>
        <p v-if="success" class="msg msg-success">{{ success }}</p>

        <button class="submit-btn" type="submit" :disabled="submitting">
          {{ submitting ? 'Proszę czekać...' : isLogin ? 'Zaloguj się' : 'Zarejestruj się' }}
        </button>
      </form>

      <p class="toggle-text">
        {{ isLogin ? 'Nie masz konta?' : 'Masz już konto?' }}
        <button class="toggle-link" type="button" @click="toggleMode">
          {{ isLogin ? 'Zarejestruj się' : 'Zaloguj się' }}
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.modal-card {
  position: relative;
  width: calc(var(--modal-w) + 20px);
  padding: 32px 24px 28px;
  background: var(--surface-strong);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  max-height: 90vh;
  overflow: hidden;
  transition: width 0.35s ease;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.close-btn:hover {
  background: var(--accent-soft);
  color: var(--text);
}

.modal-title {
  margin: 0 0 28px;
  font-family: Inter, system-ui, sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field-row div.field:first-child {
  width: fit-content - 20px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.field input {
  padding: 12px 16px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-family: Inter, system-ui, sans-serif;
  font-size: 15px;
  color: var(--text);
  background: var(--surface-soft);
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.field input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 117, 199, 0.12);
  background: var(--surface-strong);
}

.field input::placeholder {
  color: var(--muted);
}

.msg {
  margin: 0;
  font-size: 13px;
  text-align: center;
  line-height: 1.4;
}

.msg-error {
  color: #d32f2f;
}

.msg-success {
  color: #2e7d32;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  background-color: var(--primary-color);
  color: #ffffff;
  font-family: Inter, system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(79, 117, 199, 0.18);
  transition:
    background-color 0.15s,
    box-shadow 0.15s;
}

.submit-btn:hover:not(:disabled) {
  box-shadow: 0 14px 36px rgba(79, 117, 199, 0.22);
  background-color: var(--primary-color-hover);
}

.submit-btn:active:not(:disabled) {
  box-shadow: 0 4px 12px rgba(79, 117, 199, 0.18);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-text {
  margin: 20px 0 0;
  font-size: 14px;
  text-align: center;
  color: var(--muted);
}

.toggle-link {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  text-decoration: underline;
}

.toggle-link:hover {
  color: var(--primary-color-hover);
}
</style>
