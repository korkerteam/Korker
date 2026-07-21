<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  availability: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:availability'])

const dayKeys = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
const dayAbbr = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']

const showAllHours = ref(false)
const mirrorWeekdays = ref(false)
const isDragging = ref(false)
const dragMode = ref(null)

const visibleHours = computed(() => {
  if (showAllHours.value) return Array.from({ length: 24 }, (_, h) => h)
  return [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
})

function getSlotLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00-${String((hour + 1) % 24).padStart(2, '0')}:00`
}

function isCellSelected(day, hour) {
  return (props.availability?.[day] || []).includes(getSlotLabel(hour))
}

function applyCellState(availability, day, hour, selected) {
  const avail = { ...(availability || {}) }
  if (!avail[day]) avail[day] = []
  const slots = [...avail[day]]
  const slot = getSlotLabel(hour)
  const idx = slots.indexOf(slot)
  if (selected && idx === -1) slots.push(slot)
  if (!selected && idx > -1) slots.splice(idx, 1)
  avail[day] = slots
  return avail
}

function setCellState(day, hour, selected) {
  if (props.readonly) return
  emit('update:availability', applyCellState(props.availability, day, hour, selected))
}

function toggleCell(day, hour, skipMirror) {
  if (props.readonly) return
  const was = isCellSelected(day, hour)
  const targetState = !was
  let nextAvailability = applyCellState(props.availability, day, hour, targetState)

  if (!skipMirror && mirrorWeekdays.value) {
    const mirroredDays = dayKeys.slice(0, 5).filter((d) => d !== day)
    for (const d of mirroredDays) {
      nextAvailability = applyCellState(nextAvailability, d, hour, targetState)
    }
  }

  emit('update:availability', nextAvailability)
}

function onCellMouseDown(day, hour) {
  if (props.readonly) return
  isDragging.value = true
  dragMode.value = isCellSelected(day, hour) ? 'deselect' : 'select'
  toggleCell(day, hour)
}

function onCellMouseEnter(day, hour) {
  if (!isDragging.value || props.readonly) return
  if (dragMode.value === 'select' && !isCellSelected(day, hour)) toggleCell(day, hour, false)
  if (dragMode.value === 'deselect' && isCellSelected(day, hour)) toggleCell(day, hour, false)
}

function onGridMouseUp() {
  isDragging.value = false
  dragMode.value = null
}

function clearAvailability() {
  if (props.readonly) return
  const cleared = Object.fromEntries(dayKeys.map((d) => [d, []]))
  emit('update:availability', cleared)
}

function onCellKeydown(e, day, hour) {
  if (props.readonly) return
  const idx = dayKeys.indexOf(day)
  let nextDay = idx
  let nextHour = hour
  if (e.key === 'ArrowRight') nextDay = Math.min(idx + 1, 6)
  else if (e.key === 'ArrowLeft') nextDay = Math.max(idx - 1, 0)
  else if (e.key === 'ArrowDown') nextHour = Math.min(hour + 1, 23)
  else if (e.key === 'ArrowUp') nextHour = Math.max(hour - 1, 0)
  else if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    toggleCell(day, hour)
    return
  } else return
  e.preventDefault()
  const el = document.querySelector(`[data-cell="${dayKeys[nextDay]}-${nextHour}"]`)
  el?.focus()
}

function toggleShowAllHours() {
  showAllHours.value = !showAllHours.value
}
</script>

<template>
  <div class="availability-section">
    <div class="av-header-row">
      <span class="field-label">{{ readonly ? 'Dostępność' : 'Dostępne godziny w tygodniu' }}</span>
      <label v-if="!readonly" class="mirror-toggle">
        <input type="checkbox" v-model="mirrorWeekdays" />
        <span class="mirror-label">Lustro (Pn–Pt)</span>
      </label>
    </div>
    <div class="av-grid-wrap">
      <div
        class="av-grid"
        :class="{ 'av-grid-readonly': readonly }"
        @mouseup="onGridMouseUp"
        @mouseleave="onGridMouseUp"
      >
        <div class="av-header-cell av-corner"></div>
        <div v-for="day in dayAbbr" :key="day" class="av-header-cell av-day-header">
          {{ day }}
        </div>
        <template v-for="hour in visibleHours" :key="hour">
          <div class="av-header-cell av-time-header">{{ String(hour).padStart(2, '0') }}:00</div>
          <div
            v-for="day in dayKeys"
            :key="`${day}-${hour}`"
            :data-cell="`${day}-${hour}`"
            class="av-cell"
            :class="{ selected: isCellSelected(day, hour) }"
            @mousedown.prevent="onCellMouseDown(day, hour)"
            @mouseenter="onCellMouseEnter(day, hour)"
            @keydown="onCellKeydown($event, day, hour)"
            :tabindex="readonly ? -1 : 0"
            :role="readonly ? undefined : 'checkbox'"
            :aria-checked="readonly ? undefined : isCellSelected(day, hour)"
          ></div>
        </template>
      </div>
    </div>
    <div v-if="!readonly" class="av-actions-row">
      <button type="button" class="btn btn-text av-action-btn" @click="clearAvailability">
        Wyczyść
      </button>
      <button type="button" class="btn btn-text av-action-btn" @click="toggleShowAllHours">
        {{ showAllHours ? 'Pokaż mniej' : 'Pokaż więcej godzin' }}
      </button>
    </div>
    <button
      v-else
      type="button"
      class="av-action-btn av-action-btn-single"
      @click="toggleShowAllHours"
    >
      {{ showAllHours ? 'Pokaż mniej' : 'Pokaż więcej godzin' }}
    </button>
  </div>
</template>

<style scoped>
.availability-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}
.av-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.field-label {
  font-weight: 600;
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.mirror-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}
.mirror-toggle input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.mirror-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.av-grid-wrap {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-soft);
}
.av-grid {
  display: grid;
  grid-template-columns: 44px repeat(7, 1fr);
  grid-auto-rows: 22px;
  gap: 2px;
  padding: 4px;
  background: var(--surface-soft);
  user-select: none;
}
.av-header-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  background: var(--surface);
  border-radius: 3px;
  padding: 2px;
}
.av-corner {
  background: transparent;
}
.av-day-header {
  font-size: 9px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: var(--surface-soft);
  overflow: hidden;
  text-overflow: ellipsis;
}
.av-time-header {
  background: transparent;
  color: var(--muted);
}
.av-cell {
  border-radius: 3px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.08s;
  outline: none;
  min-width: 0;
}
.av-grid-readonly .av-cell {
  cursor: default;
}
.av-cell.selected {
  background: var(--accent);
  border-color: var(--accent);
}
.av-cell:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
}
.av-cell.selected:hover {
  background: var(--accent-strong);
  border-color: var(--accent-strong);
}
.av-cell:focus-visible {
  box-shadow: 0 0 0 2px var(--accent);
}
.av-actions-row {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.av-action-btn {
  font-size: 12px;
  padding: 6px 14px;
  color: #4f75c7;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.15s;
  font-family: inherit;
}
.av-action-btn:hover {
  background: #f3f4f6;
}
.av-action-btn-single {
  align-self: center;
  margin-top: 4px;
}
</style>
