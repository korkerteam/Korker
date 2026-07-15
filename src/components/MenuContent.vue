<script setup>
const emit = defineEmits([
  'toggleProfile',
  'toggleRank',
  'toggleTeachers',
  'toggleSearch',
  'toggleCalendar',
  'openAuth',
])

function handleRankClick() {
  emit('toggleRank')
}

function handleTeachersClick() {
  emit('toggleTeachers')
}

function handleSearchClick() {
  emit('toggleSearch')
}

function handleCalendarClick() {
  emit('toggleCalendar')
}
</script>

<template>
  <nav class="menu-sidebar">
    <button class="menu-item search" @click="handleSearchClick">
      <span class="icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M10.5 3a7.5 7.5 0 015.96 12.19l4.67 4.67a1 1 0 01-1.42 1.42l-4.67-4.67A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z"
          />
        </svg>
      </span>
      <span>Szukaj korepetycji</span>
    </button>

    <button class="menu-item rank" @click="handleRankClick">
      <span class="icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2l2.54 7.82H22l-6.5 4.72 2.5 7.86L12 17.64 6 22.4l2.5-7.86L2 9.82h7.46L12 2z"
          />
        </svg>
      </span>
      <span>Ranking</span>
    </button>

    <button class="menu-item teachers" @click="handleTeachersClick">
      <span class="icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"
          />
        </svg>
      </span>
      <span>Moi nauczyciele</span>
    </button>

    <button class="menu-item menu-item-calendar" @click="handleCalendarClick">
      <span class="icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M7 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm13 7H4v10h16V9z"
          />
        </svg>
      </span>
      <span>Kalendarz</span>
    </button>
  </nav>
</template>

<style scoped>
.menu-sidebar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px 0;
  max-height: 78vh;
  overflow: visible;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  min-height: 72px;
  padding: 18px 20px;
  border: none;
  border-radius: 0 38px 38px 0;
  background: linear-gradient(180deg, #3e69d1 0%, #264fa7 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  text-align: left;
  cursor: pointer;
  box-shadow: none;
  transition:
    transform 0.22s ease,
    background 0.22s ease;
}

:root[data-contrast='high'] .menu-item {
  background: linear-gradient(135deg, #f2b500 0%, #ffcf33 100%);
  color: #1f2937;
}

.menu-item:hover {
  background: linear-gradient(180deg, #4b79e2 0%, #2e60be 100%);
}

:root[data-contrast='high'] .menu-item:hover {
  background: linear-gradient(135deg, #ffcf33 0%, #f2b500 100%);
}

.icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
}

:root[data-contrast='high'] .icon {
  background: rgba(31, 41, 55, 0.12);
}

.icon svg {
  width: 20px;
  height: 20px;
  fill: #ffffff;
}

:root[data-contrast='high'] .icon svg {
  fill: #1f2937;
}
</style>
