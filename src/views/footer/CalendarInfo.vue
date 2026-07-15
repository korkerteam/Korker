<template>
  <main class="calendar-view-simple">
    <div class="calendar-card">
      <div class="calendar-top">
        <div class="calendar-title">
          <span class="calendar-day-name">Śr</span>
          <div>
            <div class="calendar-month-label">lipiec 2026</div>
            <div class="calendar-meta">Dzień 196, Tydzień 29</div>
          </div>
        </div>
        <button class="calendar-today">Dzisiaj</button>
      </div>

      <div class="calendar-controls">
        <button class="nav-button">‹</button>
        <select class="calendar-select">
          <option>lip</option>
          <option>sie</option>
          <option>wrz</option>
        </select>
        <select class="calendar-select">
          <option>2026</option>
          <option>2027</option>
          <option>2028</option>
        </select>
        <select class="calendar-select">
          <option>Wakacje</option>
          <option>Zima</option>
          <option>Wiosna</option>
        </select>
        <select class="calendar-select">
          <option>Dzień początku...</option>
          <option>Poniedziałek</option>
          <option>Niedziela</option>
        </select>
      </div>

      <div class="calendar-grid">
        <div class="weekday">Po</div>
        <div class="weekday">Wt</div>
        <div class="weekday">Śr</div>
        <div class="weekday">Cz</div>
        <div class="weekday">Pt</div>
        <div class="weekday">So</div>
        <div class="weekday">Ni</div>

        <div class="day empty"></div>
        <div class="day empty"></div>
        <div class="day">1</div>
        <div class="day">2</div>
        <div class="day">3</div>
        <div class="day empty">4</div>
        <div class="day empty">5</div>

        <div class="day">6</div>
        <div class="day">7</div>
        <div class="day">8</div>
        <div class="day">9</div>
        <div class="day">10</div>
        <div class="day">11</div>
        <div class="day">12</div>

        <div class="day">13</div>
        <div class="day">14</div>
        <div class="day active">15</div>
        <div class="day">16</div>
        <div class="day">17</div>
        <div class="day">18</div>
        <div class="day">19</div>

        <div class="day">20</div>
        <div class="day">21</div>
        <div class="day">22</div>
        <div class="day">23</div>
        <div class="day">24</div>
        <div class="day">25</div>
        <div class="day">26</div>

        <div class="day">27</div>
        <div class="day">28</div>
        <div class="day">29</div>
        <div class="day">30</div>
        <div class="day">31</div>
        <div class="day empty"></div>
        <div class="day empty"></div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.calendar-view-simple {
  width: 100%;
  display: flex;
  justify-content: center;
}

.calendar-card {
  width: 100%;
  max-width: 760px;
  background: #ffffff;
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.calendar-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}

.calendar-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.calendar-day-name {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: #f8fafc;
  color: #0f172a;
  font-weight: 900;
}

.calendar-month-label {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
}

.calendar-meta {
  color: #475569;
  font-size: 0.95rem;
}

.calendar-today {
  border: none;
  background: #2563eb;
  color: white;
  padding: 12px 20px;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 700;
}

.calendar-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.nav-button,
.calendar-select {
  border: 1px solid #dbeafe;
  border-radius: 16px;
  padding: 12px 16px;
  background: #f8fbff;
  color: #0f172a;
  font-weight: 700;
  cursor: pointer;
}

.calendar-select {
  min-width: 140px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}

.weekday {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
}

.day {
  min-height: 72px;
  border-radius: 20px;
  background: #f8fbff;
  color: #0f172a;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.day.empty {
  background: transparent;
  opacity: 0;
}

.day.active {
  background: #2563eb;
  color: white;
}

@media (max-width: 760px) {
  .calendar-card {
    padding: 18px;
  }

  .calendar-controls {
    justify-content: stretch;
  }

  .calendar-select,
  .nav-button {
    flex: 1 1 150px;
  }
}
</style>
