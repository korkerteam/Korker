<script setup>
import { ref } from 'vue'
import LoadingBox from '@/components/LoadingBox.vue'

const emit = defineEmits(['show-teacher', 'remove-teacher'])
const props = defineProps({
  teachers: {
    type: Array,
    default: () => [],
  },
})

const loading = ref(false)

function onShow(teacher) {
  emit('show-teacher', teacher)
}

function onRemove(teacher) {
  emit('remove-teacher', teacher)
}
</script>

<template>
  <LoadingBox v-if="loading" />
  <div v-else class="teacher-panel">
    <div class="teacher-header">
      <div>
        <h3>Moi Nauczyciele</h3>
        <p class="sub">Lista nauczycieli dodanych do twojego konta</p>
      </div>
    </div>

    <div class="teacher-card-list">
      <template v-if="teachers.length">
        <div v-for="teacher in teachers" :key="teacher.name" class="teacher-row">
          <div class="avatar">{{ teacher.name.charAt(0) }}</div>
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
      <p v-else class="empty-state">Jeszcze nie zapisano żadnego nauczyciela.</p>
    </div>
  </div>
</template>

<style scoped>
.teacher-panel {
  width: min(520px, 100%);
  background: #ffffff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 18px 40px rgba(20, 40, 80, 0.08);
  border: 1px solid rgba(79, 117, 199, 0.08);
  font-family: Inter, system-ui, sans-serif;
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

.teacher-card-list {
  margin-top: 14px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 6px;
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
  margin-bottom: 10px;
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
  padding: 16px;
}

@media (max-width: 800px) {
  .teacher-panel {
    width: 100%;
  }
  .teacher-row {
    padding: 10px;
  }
  .avatar {
    width: 40px;
    height: 40px;
  }
}
</style>
