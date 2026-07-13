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

const hasAnyFilterSelected = computed(() => {
  return (
    selectedFilters.value.subjects.length > 0 ||
    selectedFilters.value.levels.length > 0 ||
    selectedFilters.value.tags.length > 0
  )
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

function toggleAllFilters() {
  if (hasAnyFilterSelected.value) {
    selectedFilters.value = {
      subjects: [],
      levels: [],
      tags: [],
    }
    return
  }

  selectedFilters.value = {
    subjects: [...subjectOptions],
    levels: [...levelOptions],
    tags: [...tagOptions],
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
      <button class="confirm-button" type="button" @click="toggleAllFilters()">
        {{ hasAnyFilterSelected ? 'Odznacz wszystkie filtry' : 'Zaznacz wszystkie filtry' }}
      </button>
      <button class="confirm-button" type="button" @click="emit('confirm')">
        Potwierdź filtry
      </button>
    </div>
  </div>
</template>

<style scoped>
.FilterPage {
  border: 1.5px solid var(--primary-color);
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  margin: 0 auto;
  border-radius: 16px;
  background: #ffffff;
  min-height: 0;
  max-height: calc(100vh - 180px);
  overflow: auto;
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
  gap: 14px;
}

.confirm-button {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  cursor: pointer;
  font-weight: 700;
  background: var(--primary-color);
  color: white;
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
