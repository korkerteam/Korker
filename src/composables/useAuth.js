import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase.js'
import { fetchProfile } from '@/services/profileService.js'

const user = ref(null)
const session = ref(null)
const loading = ref(true)
const showAuthModal = ref(false)
const authModalMode = ref('login')

const profileName = ref('')
const profileInitial = ref('?')
const needsProfile = ref(false)
const profileData = ref(null)
const profileLoading = ref(true)

let loadProfilePromise = null

async function loadProfile() {
  if (loadProfilePromise) return loadProfilePromise
  loadProfilePromise = (async () => {
    try {
      const profile = await fetchProfile(user.value?.id)
      profileData.value = profile
      if (profile?.name) {
        const full = [profile.name, profile.surname].filter(Boolean).join(' ')
        profileName.value = full
        profileInitial.value = profile.name.charAt(0).toUpperCase()
        needsProfile.value = false
      } else {
        needsProfile.value = true
      }
    } catch {
      needsProfile.value = true
    } finally {
      loadProfilePromise = null
      profileLoading.value = false
    }
  })()
  return loadProfilePromise
}

function setProfileName(name) {
  profileName.value = name
  profileInitial.value = name?.charAt(0)?.toUpperCase() || '?'
}

function clearNeedsProfile() {
  needsProfile.value = false
}

supabase.auth.onAuthStateChange((event, newSession) => {
  if (event === 'INITIAL_SESSION') return
  session.value = newSession
  user.value = newSession?.user ?? null
  loading.value = false
  if (newSession?.user) {
    loadProfile()
  } else {
    profileName.value = ''
    profileInitial.value = '?'
    needsProfile.value = false
    profileData.value = null
    profileLoading.value = false
  }
})

supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
  session.value = currentSession
  user.value = currentSession?.user ?? null
  loading.value = false
})

export function useAuth() {
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signUp(email, password, options = {}) {
    const { data, error } = await supabase.auth.signUp({ email, password, options })
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  function openAuthModal(mode = 'login') {
    authModalMode.value = mode
    showAuthModal.value = true
  }

  function closeAuthModal() {
    showAuthModal.value = false
    authModalMode.value = 'login'
  }

  const isAuthenticated = computed(() => !!user.value)

  return {
    user,
    session,
    loading,
    isAuthenticated,
    showAuthModal,
    authModalMode,
    profileName,
    profileInitial,
    profileData,
    profileLoading,
    setProfileName,
    needsProfile,
    clearNeedsProfile,
    signIn,
    signUp,
    signOut,
    openAuthModal,
    closeAuthModal,
  }
}
