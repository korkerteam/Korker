<script setup>
import { computed, ref } from 'vue'

const days = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']
const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

const selectedSlots = ref([])
const selectedDay = ref(days[0])

const daySlots = computed(() => {
  return hours.map((hour) => ({
    hour,
    selected: selectedSlots.value.includes(`${selectedDay.value}-${hour}`),
  }))
})

function toggleSlot(hour) {
  const key = `${selectedDay.value}-${hour}`
  const exists = selectedSlots.value.includes(key)

  if (exists) {
    selectedSlots.value = selectedSlots.value.filter((slot) => slot !== key)
  } else {
    selectedSlots.value = [...selectedSlots.value, key]
  }
}
</script>

<template>
  <section class="calendar-view">
    <div class="panel-card">
      <div class="eyebrow">Kalendarz</div>
      <h2>Wybierz dni i godziny swoich lekcji</h2>
      <p>
        Kliknij w dostępne sloty, aby oznaczyć, kiedy chcesz prowadzić lekcje. Zaznaczone terminy
        będą widoczne poniżej.
      </p>

      <div class="day-switcher">
        <button
          v-for="day in days"
          :key="day"
          class="day-chip"
          :class="{ active: selectedDay === day }"
          @click="selectedDay = day"
        >
          {{ day }}
        </button>
      </div>

      <div class="slot-grid">
        <button
          v-for="slot in daySlots"
          :key="slot.hour"
          class="slot-btn"
          :class="{ selected: slot.selected }"
          @click="toggleSlot(slot.hour)"
        >
          {{ slot.hour }}
        </button>
      </div>

      <div class="summary-card">
        <h3>Wybrane terminy</h3>
        <p v-if="selectedSlots.length === 0">Jeszcze nie wybrałeś żadnego slotu.</p>
        <ul v-else>
          <li v-for="slot in selectedSlots" :key="slot">{{ slot }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.calendar-view {
  width: 100%;
}

.panel-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fbff 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.45rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h2 {
  margin: 1rem 0 0.75rem;
  font-size: clamp(1.4rem, 2.2vw, 1.9rem);
  color: #0f172a;
}

p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.day-switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin: 1.1rem 0 1rem;
}

.day-chip {
  border: 1px solid #dbeafe;
  background: #f8fbff;
  color: #334155;
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.day-chip.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.slot-btn {
  border: 1px solid #dbeafe;
  background: #ffffff;
  color: #334155;
  border-radius: 16px;
  padding: 0.8rem 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slot-btn.selected {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.summary-card {
  margin-top: 1rem;
  border-radius: 20px;
  padding: 1rem 1.1rem;
  background: #f8fbff;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.summary-card h3 {
  margin: 0 0 0.55rem;
  color: #0f172a;
}

.summary-card ul {
  margin: 0;
  padding-left: 1rem;
  color: #475569;
  display: grid;
  gap: 0.35rem;
}
</style>
