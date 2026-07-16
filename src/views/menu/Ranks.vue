<script setup>
import { inject, onMounted, ref } from 'vue'
import LoadingBox from '@/components/LoadingBox.vue'
import { supabase } from '@/lib/supabase.js'

const loading = ref(true)
const rankingData = ref([])
const showTeacherProfile = inject('showTeacherProfile', null)

onMounted(async () => {
  try {
    const { data: rows, error } = await supabase
      .from('users')
      .select('id, name, surname, profile_picture, tutor_post')
      .eq('account_type', 'tutor')
      .not('tutor_post', 'is', null)

    if (!error && rows) {
      rankingData.value = rows
        .filter((row) => row.tutor_post)
        .map((row, index) => {
          const tutorPost = row.tutor_post || {}
          const renderedName = [row.name, row.surname].filter(Boolean).join(' ') || 'Korepetytor'

          return {
            id: row.id || `${renderedName}-${index}`,
            name: renderedName,
            subject: tutorPost.subject || 'Brak danych',
            level: tutorPost.level || 'Brak danych',
            bio: tutorPost.description || '',
            price: tutorPost.price || null,
            city: tutorPost.city || '',
            lessonPlace: tutorPost.lessonPlace || '',
            tags: tutorPost.teachingFormats || [],
            image: tutorPost.photo || row.profile_picture || null,
          }
        })
        .slice(0, 10)
    }
  } finally {
    loading.value = false
  }
})

function openTeacher(entry) {
  if (!showTeacherProfile || !entry) return

  showTeacherProfile({
    id: entry.id,
    name: entry.name,
    subject: entry.subject,
    level: entry.level,
    bio: entry.bio,
    price: entry.price,
    city: entry.city,
    lessonPlace: entry.lessonPlace,
    tags: entry.tags,
    image: entry.image,
  })
}
</script>

<template>
  <LoadingBox v-if="loading" />
  <div v-else class="ranks-panel">
    <div class="ranks-header">
      <div class="header-badge">🏆 TOP 10</div>
      <div>
        <h3>Top nauczycieli</h3>
        <p>Skarbimierzyce · aktualna klasyfikacja</p>
      </div>
    </div>

    <div class="ranks-body">
      <ol class="ranks-list">
        <li
          v-for="(entry, index) in rankingData"
          :key="entry.id || entry.name"
          :class="['rank-row', { featured: index < 3 }]"
          role="button"
          tabindex="0"
          @click="openTeacher(entry)"
          @keydown.enter.prevent="openTeacher(entry)"
          @keydown.space.prevent="openTeacher(entry)"
        >
          <div class="rank-pill" :class="`rank-${index + 1}`">
            <span class="rank-number">{{ index + 1 }}</span>
          </div>
          <div class="rank-content">
            <span class="name">{{ entry.name }}</span>
            <span class="meta">{{ entry.subject }}</span>
          </div>
          <span class="subject-chip">{{ entry.subject }}</span>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.ranks-panel {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  background: linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-soft) 100%);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
  overflow: hidden;
  font-family: Inter, sans-serif;
  min-height: 0;
  max-height: calc(74vh - 50px);
  display: flex;
  flex-direction: column;
}

.ranks-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 22px;
  background: linear-gradient(120deg, var(--accent-soft) 0%, rgba(255, 255, 255, 0.08) 100%);
  border-bottom: 1px solid var(--border);
}

.header-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--primary-color);
  color: white;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ranks-header h3 {
  margin: 0 0 4px;
  color: var(--text);
  font-size: 20px;
  font-weight: 800;
}

.ranks-header p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.ranks-body {
  padding: 18px 20px 24px 20px;
  overflow-y: auto;
}

.ranks-body::-webkit-scrollbar {
  width: 10px;
}
.ranks-body::-webkit-scrollbar-track {
  background: transparent;
}
.ranks-body::-webkit-scrollbar-thumb {
  background: rgba(79, 117, 199, 0.22);
  border-radius: 8px;
}
.ranks-body:hover::-webkit-scrollbar-thumb {
  background: rgba(79, 117, 199, 0.32);
}
.ranks-body {
  scrollbar-width: thin;
  scrollbar-color: rgba(79, 117, 199, 0.22) transparent;
}

.ranks-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rank-row {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  cursor: pointer;
  border-radius: 16px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.rank-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
  background: var(--accent-soft);
}

.rank-row.featured {
  background: linear-gradient(115deg, rgba(79, 117, 199, 0.12) 0%, var(--surface-strong) 100%);
  border-color: rgba(79, 117, 199, 0.22);
}

.rank-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  color: white;
  font-weight: 800;
  font-size: 15px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.rank-1 {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.rank-2 {
  background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%);
}

.rank-3 {
  background: linear-gradient(135deg, #c97a2b 0%, #e9b16b 100%);
}

.rank-4,
.rank-5,
.rank-6,
.rank-7,
.rank-8,
.rank-9,
.rank-10 {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-hover) 100%);
}

.rank-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.name {
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.01em;
}

.meta {
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
}

.subject-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
  border: 1px solid var(--border);
  white-space: nowrap;
}
</style>
