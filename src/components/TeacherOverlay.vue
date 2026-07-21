<script setup>
import { computed, ref, watch } from 'vue'
import LoadingBox from '@/components/LoadingBox.vue'
import { supabase } from '@/lib/supabase.js'

const props = defineProps({ teacher: { type: Object, default: null } })
const emit = defineEmits(['close'])

const profile = ref(null)
const tutorPost = ref(null)
const loading = ref(false)
const error = ref('')

const displayName = computed(() => {
  if (!profile.value) return props.teacher?.name || 'Korepetytor'
  return (
    profile.value.nickname ||
    [profile.value.name, profile.value.surname].filter(Boolean).join(' ') ||
    props.teacher?.name ||
    'Korepetytor'
  )
})

function getFirstOffer(tp) {
  if (!tp) return null
  return Array.isArray(tp) ? tp[0] || null : tp
}

const firstOffer = computed(() => getFirstOffer(tutorPost.value))
const profileFirstOffer = computed(() => getFirstOffer(profile.value?.tutor_post))

const descriptionText = computed(() => {
  const candidates = [
    props.teacher?.bio,
    props.teacher?.description,
    firstOffer.value?.description,
    profileFirstOffer.value?.description,
    props.teacher?.tutor_post?.description,
    props.teacher?.tutorPost?.description,
  ]

  const match = candidates.find((value) => typeof value === 'string' && value.trim())
  return match?.trim() || 'Brak opisu'
})

const subjectText = computed(() => {
  return (
    firstOffer.value?.subject ||
    props.teacher?.subject ||
    profileFirstOffer.value?.subject ||
    'Brak danych'
  )
})

const levelText = computed(() => {
  return (
    firstOffer.value?.level ||
    props.teacher?.level ||
    profileFirstOffer.value?.level ||
    'Brak danych'
  )
})

const priceText = computed(() => {
  const price = firstOffer.value?.price ?? props.teacher?.price ?? profileFirstOffer.value?.price
  return price ? `${price} zł/h` : 'Brak danych'
})

const locationText = computed(() => {
  return (
    firstOffer.value?.city ||
    props.teacher?.city ||
    profile.value?.city ||
    profileFirstOffer.value?.city ||
    'Brak danych'
  )
})

const formats = computed(() => {
  const place = firstOffer.value?.lessonPlace || profileFirstOffer.value?.lessonPlace
  if (place) return [place]
  const fromTutorPost =
    firstOffer.value?.teachingFormats || profileFirstOffer.value?.teachingFormats
  if (Array.isArray(fromTutorPost) && fromTutorPost.length) return fromTutorPost
  const single = firstOffer.value?.teachingFormat || profileFirstOffer.value?.teachingFormat
  return single ? [single] : []
})

const avatarSrc = computed(() => {
  return (
    props.teacher?.image || props.teacher?.profile_picture || profile.value?.profile_picture || ''
  )
})

watch(
  () => props.teacher,
  async (teacher) => {
    if (!teacher) {
      profile.value = null
      tutorPost.value = null
      error.value = ''
      return
    }

    loading.value = true
    error.value = ''

    const fallbackProfile = {
      ...teacher,
      nickname: teacher.nickname || teacher.name || '',
      name: teacher.name || '',
      surname: teacher.surname || '',
      account_type: teacher.account_type || teacher.accountType || 'tutor',
      city: teacher.city || '',
      profile_picture: teacher.image || teacher.profile_picture || '',
      tutor_post: teacher.tutor_post || teacher.tutorPost || null,
    }

    const lookupId = teacher.auth_id || teacher.authId || teacher.user_id || teacher.id

    try {
      if (lookupId) {
        let query = supabase.from('users').select('*')
        if (teacher.auth_id || teacher.authId || teacher.user_id) {
          query = query.eq('auth_id', lookupId)
        } else {
          query = query.eq('id', lookupId)
        }

        const { data, fetchError } = await query.maybeSingle()
        if (fetchError) throw fetchError

        profile.value = data || fallbackProfile
        tutorPost.value = data?.tutor_post || fallbackProfile.tutor_post || null
      } else {
        profile.value = fallbackProfile
        tutorPost.value = fallbackProfile.tutor_post || null
      }
    } catch (err) {
      console.error('Failed to load teacher profile:', err)
      error.value = 'Nie udało się pobrać pełnych danych profilu.'
      profile.value = fallbackProfile
      tutorPost.value = fallbackProfile.tutor_post || null
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="teacher" class="teacher-overlay" @click="emit('close')">
    <div class="teacher-card-modal" @click.stop>
      <button class="close-x" @click="emit('close')">×</button>

      <LoadingBox v-if="loading" />

      <template v-else>
        <div class="teacher-modal-header">
          <div v-if="avatarSrc" class="avatar-large">
            <img :src="avatarSrc" :alt="displayName" />
          </div>
          <div v-else class="avatar-large">{{ displayName?.charAt(0) || 'K' }}</div>
          <div>
            <h3>{{ displayName }}</h3>
            <p class="muted">{{ subjectText }} • {{ levelText }}</p>
          </div>
        </div>

        <div class="teacher-modal-body">
          <div v-if="error" class="error-text">{{ error }}</div>

          <div class="info-grid">
            <div class="info-cell">
              <span class="label">Przedmiot</span>
              <span class="value">{{ subjectText }}</span>
            </div>
            <div class="info-cell">
              <span class="label">Payout</span>
              <span class="value">{{ priceText }}</span>
            </div>
            <div class="info-cell">
              <span class="label">Lokalizacja</span>
              <span class="value">{{ locationText }}</span>
            </div>
            <div v-if="formats.length" class="info-cell">
              <span class="label">Miejsce</span>
              <span class="value">{{ formats.join(', ') }}</span>
            </div>
          </div>

          <div class="description-card">
            <h4>Opis</h4>
            <p>{{ descriptionText }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.teacher-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(10, 20, 40, 0.4);
}
.teacher-card-modal {
  background: var(--surface-strong);
  padding: 20px;
  border-radius: 18px;
  width: min(620px, 92vw);
  box-shadow: var(--shadow-soft);
  position: relative;
  max-height: 88vh;
  overflow-y: auto;
}
.teacher-modal-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}
.avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  border: 2px solid var(--border);
  flex-shrink: 0;
}
.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.teacher-modal-body {
  color: var(--text);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.info-grid {
  display: grid;
  gap: 10px;
}
.info-cell {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.label {
  font-weight: 700;
  color: var(--muted);
  min-width: 110px;
}
.value {
  text-align: right;
  color: var(--text);
  white-space: pre-line;
}
.description-card {
  padding: 12px;
  border-radius: 12px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
}
.description-card h4 {
  margin: 0 0 6px;
  font-size: 15px;
}
.description-card p {
  margin: 0;
  line-height: 1.6;
  white-space: pre-line;
}
.close-x {
  position: absolute;
  right: 12px;
  top: 8px;
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
}
.error-text {
  color: #c2410c;
  font-size: 14px;
}
</style>
