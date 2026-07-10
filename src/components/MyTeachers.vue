<script setup>
const props = defineProps({
  teachers: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="TeacherPage">
    <div class="teacher-content">
      <h3>Moi Nauczyciele</h3>
      <div v-if="props.teachers.length" class="teacher-list">
        <div v-for="teacher in props.teachers" :key="teacher.name" class="teacher-card">
          <strong>{{ teacher.name }}</strong>
          <p>{{ teacher.subject }} • {{ teacher.level }}</p>
        </div>
      </div>
      <p v-else class="empty-state">Jeszcze nie zapisano żadnego nauczyciela.</p>
    </div>
  </div>
</template>

<style scoped>
.TeacherPage {
  border: 1.5px solid #4f75c7;
  width: 700px;
  height: 600px;
  margin-top: 110px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: #ffffff;
  padding: 24px;
  overflow: hidden;
}

.teacher-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.teacher-list {
  display: grid;
  gap: 10px;
  overflow-y: auto;
  padding-right: 4px;
}

.teacher-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  background: #f9fafb;
}

.empty-state {
  color: #6b7280;
}
</style>
