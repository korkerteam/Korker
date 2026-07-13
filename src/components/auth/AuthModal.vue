<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { translateAuthError } from '@/utils/authErrors.js'

const router = useRouter()

const emit = defineEmits(['close'])

const { signIn, signUp } = useAuth()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const submitting = ref(false)

function toggleMode() {
  isLogin.value = !isLogin.value
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

  if (password.value.length < 6) {
    error.value = 'Hasło musi mieć co najmniej 6 znaków'
    return
  }

  submitting.value = true
  try {
    if (isLogin.value) {
      await signIn(email.value, password.value)
      router.push('/')
    } else {
      const { user: newUser } = await signUp(email.value, password.value)
      if (newUser) {
        success.value = 'Konto utworzone! Sprawdź email, aby potwierdzić rejestrację.'
        return
      }
    }
    emit('close')
  } catch (err) {
    error.value = translateAuthError(err.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
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
          />
        </div>

        <div class="field">
          <label for="password">Hasło</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••"
            autocomplete="current-password"
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
  width: 100%;
  max-width: 360px;
  padding: 32px 24px 28px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
  max-height: 90vh;
  overflow-y: auto;
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
  color: #888;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-title {
  margin: 0 0 28px;
  font-family: Inter, system-ui, sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
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

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.field input {
  padding: 12px 16px;
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  font-family: Inter, system-ui, sans-serif;
  font-size: 15px;
  color: #1a1a1a;
  background: #fafafa;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.field input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 117, 199, 0.12);
  background: #fff;
}

.field input::placeholder {
  color: #aaa;
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
  color: #666;
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
