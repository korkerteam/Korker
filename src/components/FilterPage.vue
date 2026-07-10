<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ subjects: [], levels: [], tags: [] }),
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const subjectOptions = ['Matematyka', 'Fizyka', 'Język polski', 'Angielski']
const levelOptions = ['Szkoła podstawowa', 'Liceum', 'Studia']
const tagOptions = ['Matura', 'Egzamin', 'Online', 'Na miejscu']

const selectedFilters = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function toggleSelection(category, value) {
  const current = [...(selectedFilters.value[category] || [])]
  const index = current.indexOf(value)

  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(value)
  }

  selectedFilters.value = {
    ...selectedFilters.value,
    [category]: current,
  }
}
</script>

<template>
  <div class="FilterPage">
    <h3>Filtry</h3>

    <div class="filter-group">
      <h4>Przedmioty</h4>
      <div class="filter-options">
        <label v-for="item in subjectOptions" :key="item">
          <input
            type="checkbox"
            :checked="selectedFilters.subjects.includes(item)"
            @change="toggleSelection('subjects', item)"
          />
          {{ item }}
        </label>
      </div>
    </div>

    <div class="filter-group">
      <h4>Poziom</h4>
      <div class="filter-options">
        <label v-for="item in levelOptions" :key="item">
          <input
            type="checkbox"
            :checked="selectedFilters.levels.includes(item)"
            @change="toggleSelection('levels', item)"
          />
          {{ item }}
        </label>
      </div>
    </div>

    <div class="filter-group">
      <h4>Tagi</h4>
      <div class="filter-options">
        <label v-for="item in tagOptions" :key="item">
          <input
            type="checkbox"
            :checked="selectedFilters.tags.includes(item)"
            @change="toggleSelection('tags', item)"
          />
          {{ item }}
        </label>
      </div>
    </div>

    <div class="confirm-row">
      <button class="confirm-button" type="button" @click="emit('confirm')">
        Potwierdź filtry
      </button>
    </div>
  </div>
</template>

<style scoped>
.FilterPage {
  border: 1.5px solid #4f75c7;
  width: 700px;
  height: 600px;
  margin-top: 110px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 16px;
  background: #ffffff;
}

h3,
h4 {
  margin: 0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.confirm-row {
  margin-top: auto;
  display: flex;
  justify-content: center;
}

.confirm-button {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  cursor: pointer;
  background: #4f75c7;
  color: white;
  font-weight: 700;
}

label {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #eef2ff;
  padding: 8px 10px;
  border-radius: 999px;
}
</style>
