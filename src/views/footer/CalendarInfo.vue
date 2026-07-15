<template>
  <main class="calendar-page py-6 sm:py-8 lg:py-10">
    <div class="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
      <section
        class="hero-card relative overflow-hidden rounded-[32px] bg-white/90 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 sm:p-6 lg:p-8"
      >
        <div class="hero-glow"></div>
        <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div class="space-y-5 text-center lg:text-left">
            <div class="mx-auto max-w-xl lg:mx-0">
              <span class="hero-tag">Zintegrowany kalendarz</span>
              <h1 class="hero-title">Zaplanuj lekcje bez zbędnego zamieszania.</h1>
              <p class="hero-copy">
                Kalendarz Korker pomaga korepetytorom szybko ustalać terminy, sprawdzać dostępność i
                wysyłać przypomnienia bez chaosu.
              </p>
            </div>

            <div class="hero-actions flex flex-wrap justify-center gap-3 lg:justify-start">
              <button class="btn-primary">Zaplanuj teraz</button>
              <button class="btn-secondary">Zobacz jak działa</button>
            </div>

            <div
              class="hero-pill-grid mx-auto grid max-w-xl gap-3 text-left sm:grid-cols-2 lg:mx-0"
            >
              <article class="hero-pill">
                <span class="pill-icon">⏰</span>
                <div>
                  <h3>Szybkie sloty</h3>
                  <p>Dodawaj i blokuj terminy bez zbędnych kliknięć.</p>
                </div>
              </article>
              <article class="hero-pill">
                <span class="pill-icon">🔔</span>
                <div>
                  <h3>Przypomnienia</h3>
                  <p>Uczniowie dostają automatyczne info o nadchodzących lekcjach.</p>
                </div>
              </article>
            </div>
          </div>

          <div class="mx-auto w-full max-w-md">
            <div class="preview-top">
              <div>
                <p class="preview-label">Tydzień w skrócie</p>
                <h2 class="preview-title">Przejrzysty widok zajęć</h2>
              </div>
              <div class="preview-chip">Online + stacjonarnie</div>
            </div>

            <div class="preview-calendar">
              <div class="weekday-row">
                <span>Pn</span>
                <span>Wt</span>
                <span>Śr</span>
                <span>Cz</span>
                <span>Pt</span>
              </div>
              <div class="slot-grid">
                <span class="slot active">8:00</span>
                <span class="slot filled">9:00</span>
                <span class="slot">10:00</span>
                <span class="slot filled">11:00</span>
                <span class="slot">12:00</span>
                <span class="slot filled">13:00</span>
                <span class="slot">14:00</span>
                <span class="slot filled">15:00</span>
                <span class="slot">16:00</span>
                <span class="slot">17:00</span>
              </div>
              <div class="preview-events">
                <article class="event-card event-card--blue">
                  <p class="event-time">09:00 · 10:00</p>
                  <h3>Matematyka z Anią</h3>
                </article>
                <article class="event-card event-card--purple">
                  <p class="event-time">13:00 · 14:00</p>
                  <h3>Angielski — online</h3>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-5 grid gap-4 md:grid-cols-3">
        <article class="metric-card metric-card--purple">
          <p class="metric-label">Zajęte sloty</p>
          <h3>18</h3>
          <p class="metric-copy">Kontrolujesz zapełnienie grafiku bez stresu.</p>
        </article>
        <article class="metric-card metric-card--sky">
          <p class="metric-label">Rezerwacje</p>
          <h3>7</h3>
          <p class="metric-copy">Szybko widzisz najnowsze zgłoszenia.</p>
        </article>
        <article class="metric-card metric-card--emerald">
          <p class="metric-label">Czas oszczędzony</p>
          <h3>+32%</h3>
          <p class="metric-copy">Mniej pracy przy organizacji, więcej czasu dla uczniów.</p>
        </article>
      </section>

      <section
        class="mt-5 rounded-[28px] bg-white/95 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 sm:p-6 lg:p-8"
      >
        <div class="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div class="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
            <span class="hero-tag">Proste i skuteczne</span>
            <h2 class="feature-title">Wszystko w jednym miejscu, bez zbędnych kliknięć.</h2>
            <p class="feature-copy">
              Przejrzysty podział na zajęcia, dostępność i komunikację sprawia, że zarządzanie
              kalendarzem jest prostsze niż kiedykolwiek.
            </p>
          </div>
          <div class="mx-auto w-full max-w-xl">
            <div class="feature-list">
              <article class="feature-item">
                <span class="feature-icon">✅</span>
                <div>
                  <h3>Pełen przegląd tygodnia</h3>
                  <p>Widok zajęć jest czytelny i szybko pokazuje, co jest zaplanowane.</p>
                </div>
              </article>
              <article class="feature-item">
                <span class="feature-icon">📍</span>
                <div>
                  <h3>Online i stacjonarnie</h3>
                  <p>Wybierasz format zajęć, a system automatycznie aktualizuje dostępność.</p>
                </div>
              </article>
              <article class="feature-item">
                <span class="feature-icon">⚡</span>
                <div>
                  <h3>Szybkie potwierdzenia</h3>
                  <p>Rezerwacje trafiają od razu do kalendarza i są jasne dla obu stron.</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.calendar-page {
  background:
    radial-gradient(circle at top left, rgba(79, 117, 199, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.14), transparent 20%), #f8fbff;
}

.hero-card {
  position: relative;
}

.hero-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.18), transparent 25%),
    radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.12), transparent 20%);
  pointer-events: none;
}

.hero-tag {
  display: inline-flex;
  padding: 0.65rem 1rem;
  border-radius: 9999px;
  background: rgba(56, 189, 248, 0.12);
  color: #0f172a;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-title {
  margin: 0.5rem 0 0;
  font-size: clamp(1.85rem, 2.6vw, 2.45rem);
  line-height: 1.1;
  color: #0f172a;
}

.hero-copy {
  margin: 0.7rem auto 0;
  color: #475569;
  font-size: 0.96rem;
  line-height: 1.65;
  max-width: 38rem;
}

.hero-actions {
  margin-top: 0.25rem;
}

.btn-primary,
.btn-secondary {
  min-width: 148px;
  padding: 0.8rem 1.2rem;
  border-radius: 999px;
  font-weight: 700;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    background-color 0.22s ease;
}

.btn-primary {
  background: #2563eb;
  color: white;
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.18);
  border: 1px solid transparent;
}

.btn-primary:hover {
  transform: translateY(-2px);
  background: #1d4ed8;
}

.btn-secondary {
  background: rgba(15, 23, 42, 0.05);
  color: #0f172a;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  background: rgba(15, 23, 42, 0.08);
}

.hero-pill-grid {
  display: grid;
}

.hero-pill {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  border-radius: 22px;
  background: #f8fbff;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.hero-pill h3 {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
}

.hero-pill p {
  margin: 0;
  color: #64748b;
  font-size: 0.87rem;
  line-height: 1.5;
}

.pill-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 15px;
  background: rgba(56, 189, 248, 0.12);
  color: #0ea5e9;
  font-size: 1rem;
}

.preview-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-label {
  margin: 0;
  color: #94a3b8;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.preview-title {
  margin: 0.25rem 0 0;
  font-size: 1.2rem;
  color: #0f172a;
}

.preview-chip {
  display: inline-flex;
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
  font-size: 0.8rem;
  font-weight: 700;
}

.preview-calendar {
  border-radius: 24px;
  padding: 1.2rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), #f8fbff 98%);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.05);
}

.weekday-row,
.slot-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.6rem;
}

.weekday-row span,
.slot {
  display: grid;
  place-items: center;
  border-radius: 14px;
  padding: 0.7rem 0;
  background: #f8fbff;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 700;
}

.slot.filled {
  background: #e0f2fe;
  color: #0369a1;
}

.slot.active {
  background: #dbeafe;
  color: #1d4ed8;
}

.preview-events {
  margin-top: 1rem;
  display: grid;
  gap: 0.8rem;
}

.event-card {
  padding: 0.85rem 0.95rem;
  border-radius: 18px;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.event-card h3 {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 0.95rem;
}

.event-time {
  margin: 0;
  color: #64748b;
  font-size: 0.8rem;
}

.event-card--blue {
  border-color: rgba(59, 130, 246, 0.2);
}

.event-card--purple {
  border-color: rgba(168, 85, 247, 0.18);
}

.metric-card {
  border-radius: 24px;
  padding: 1.25rem;
  background: white;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.metric-label {
  color: #64748b;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.metric-card h3 {
  margin: 0.6rem 0 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.metric-copy {
  margin-top: 0.5rem;
  color: #475569;
  line-height: 1.6;
  font-size: 0.92rem;
}

.metric-card--purple {
  background: linear-gradient(180deg, #eef2ff 0%, #ffffff 100%);
}

.metric-card--sky {
  background: linear-gradient(180deg, #ecfeff 0%, #ffffff 100%);
}

.metric-card--emerald {
  background: linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%);
}

.feature-title {
  margin: 0.7rem 0 0;
  font-size: clamp(1.6rem, 2.2vw, 2rem);
  line-height: 1.2;
  color: #0f172a;
}

.feature-copy {
  margin: 0.7rem auto 0;
  color: #475569;
  line-height: 1.7;
  max-width: 38rem;
}

.feature-list {
  display: grid;
  gap: 0.9rem;
}

.feature-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
  padding: 1rem 1.1rem;
  border-radius: 20px;
  background: #f8fbff;
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.feature-item h3 {
  margin: 0 0 0.3rem;
  font-size: 0.95rem;
}

.feature-item p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.55;
}

.feature-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
  font-size: 1rem;
}

@media (max-width: 1024px) {
  .hero-card {
    padding: 1.8rem;
  }
}

@media (max-width: 768px) {
  .hero-card {
    padding: 1.5rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .preview-calendar {
    padding: 1rem;
  }

  .weekday-row,
  .slot-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .hero-card {
    padding: 1.25rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .weekday-row,
  .slot-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
