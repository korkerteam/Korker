<script setup>
import { ref, computed } from 'vue'
import LoadingBox from '@/components/LoadingBox.vue'

const emit = defineEmits(['show-teacher', 'remove-teacher'])
const props = defineProps({
  teachers: {
    type: Array,
    default: () => [],
  },
})

const loading = ref(false)
const selectedTeacher = ref(null)

const teacherImageMap = {
  'Anna Kowalska':
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'Piotr Nowak':
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  'Marta Wiśniewska':
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
  'Jakub Zieliński':
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  'Katarzyna Sobczak':
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
  'Maciej Płaczek':
    'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=800&q=80',
  'Natalia Wójcik':
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'Oliwier Kaczmarek':
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  'Patrycja Marek':
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
}

const isMany = computed(() => (props.teachers || []).length > 5)

function getTeacherImage(teacher) {
  return teacher?.image || teacherImageMap[teacher?.name] || ''
}

function onShow(teacher) {
  selectedTeacher.value = teacher
}

function onRemove(teacher) {
  emit('remove-teacher', teacher)
  selectedTeacher.value = null
}

function goBack() {
  selectedTeacher.value = null
}
</script>

<template>
  <LoadingBox v-if="loading" />
  <div v-else class="teacher-panel" :class="{ compact: isMany }">
    <!-- Teacher List View -->
    <template v-if="!selectedTeacher">
      <div class="teacher-header">
        <div>
          <h3>Moi Nauczyciele</h3>
          <p class="sub">{{ teachers.length }} wybranych nauczycieli</p>
        </div>
      </div>

      <div class="teacher-card-list">
        <template v-if="teachers.length">
          <div v-for="teacher in teachers" :key="teacher.name" class="teacher-row">
            <div class="avatar">
              <img
                v-if="getTeacherImage(teacher)"
                :src="getTeacherImage(teacher)"
                :alt="teacher.name"
              />
              <span v-else>{{ teacher.name.charAt(0) }}</span>
            </div>
            <div class="meta">
              <div class="name">{{ teacher.name }}</div>
              <div class="details">{{ teacher.subject }} • {{ teacher.level }}</div>
            </div>
            <div class="actions">
              <button class="btn small" @click="onShow(teacher)">Pokaż</button>
              <button class="btn small ghost" @click="onRemove(teacher)">Usuń</button>
            </div>
          </div>
        </template>
        <p v-else class="empty-state">
          Wybierz nauczycieli korzystając z funkcji "Szukaj korepetycji"
        </p>
      </div>
    </template>

    <!-- Teacher Profile View -->
    <template v-else>
      <div class="profile-header">
        <button class="back-button" @click="goBack">← Wróć</button>
      </div>

      <div class="profile-content">
        <div class="profile-image">
          <img
            v-if="getTeacherImage(selectedTeacher)"
            :src="getTeacherImage(selectedTeacher)"
            :alt="selectedTeacher.name"
          />
          <div v-else class="image-placeholder">{{ selectedTeacher.name.charAt(0) }}</div>
        </div>

        <div class="profile-info">
          <h2 class="profile-name">{{ selectedTeacher.name }}</h2>
          <p class="profile-meta">{{ selectedTeacher.subject }} • {{ selectedTeacher.level }}</p>

          <div class="bio-section">
            <p class="profile-bio">{{ selectedTeacher.bio }}</p>
          </div>

          <div v-if="selectedTeacher.tags" class="tags-section">
            <div class="tags-label">Specjalizacje:</div>
            <div class="tags-grid">
              <span v-for="tag in selectedTeacher.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>

          <button class="remove-button" @click="onRemove(selectedTeacher)">Usuń z listy</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.teacher-panel {
  width: 100%;
  max-width: 760px;
  background: #ffffff;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 18px 40px rgba(20, 40, 80, 0.08);
  border: 1px solid rgba(79, 117, 199, 0.08);
  font-family: Inter, system-ui, sans-serif;
  min-height: 0;
  max-height: calc(100vh - 180px);
  overflow: hidden;
  z-index: 20;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
}

.teacher-panel.compact {
  max-height: 60vh;
}

.teacher-header h3 {
  margin: 0;
  font-size: 20px;
  color: #123;
}
.teacher-header .sub {
  margin: 6px 0 0;
  color: #5b6b84;
  font-size: 13px;
}

.teacher-header {
  padding: 18px;
  border-bottom: 1px solid rgba(79, 117, 199, 0.08);
}

.teacher-card-list {
  margin-top: 0;
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}

.teacher-card-list::-webkit-scrollbar {
  width: 10px;
}
.teacher-card-list::-webkit-scrollbar-thumb {
  background: rgba(16, 32, 54, 0.2);
  border-radius: 8px;
}
.teacher-card-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(16, 32, 54, 0.2) transparent;
}

.teacher-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 0.02));
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 8px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b8ef0, #4f75c7);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.meta .name {
  font-weight: 700;
  color: #102036;
}
.meta .details {
  font-size: 13px;
  color: #556778;
  margin-top: 4px;
}

.actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn.small {
  font-size: 13px;
}
.btn.ghost {
  background: transparent;
  border: 1px solid rgba(17, 24, 39, 0.06);
  color: #203040;
}

.empty-state {
  color: #6b7280;
  padding: 24px;
  text-align: center;
}

.profile-header {
  padding: 12px 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(79, 117, 199, 0.08);
}

.back-button {
  background: transparent;
  border: none;
  color: #4f75c7;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 0;
  transition: all 0.2s ease;
}

.back-button:hover {
  color: #3d5a9f;
}

.profile-content {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  flex: 1;
}

.profile-image {
  display: flex;
  justify-content: center;
}

.profile-image img {
  width: 100%;
  max-width: 240px;
  height: 240px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(79, 117, 199, 0.1);
}

.image-placeholder {
  width: 240px;
  height: 240px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6b8ef0, #4f75c7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72px;
  font-weight: 700;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.profile-meta {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
}

.bio-section {
  background: linear-gradient(135deg, rgba(248, 251, 255, 0.5) 0%, rgba(238, 242, 255, 0.5) 100%);
  border: 1px solid rgba(79, 117, 199, 0.1);
  border-radius: 10px;
  padding: 12px;
  border-left: 3px solid #4f75c7;
}

.profile-bio {
  margin: 0;
  line-height: 1.6;
  color: #374151;
  font-size: 14px;
}

.tags-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-label {
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  display: inline-block;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #0c4a6e;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(79, 117, 199, 0.2);
}

.remove-button {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 6px;
}

.remove-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
}

.remove-button:active {
  transform: translateY(0);
}
</style>
