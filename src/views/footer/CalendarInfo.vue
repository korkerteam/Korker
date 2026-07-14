<template>
  <main class="calendar-page min-h-screen py-16">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section
        class="hero-card relative overflow-hidden rounded-[40px] bg-white/90 p-8 shadow-[0_45px_100px_rgba(15,23,42,0.14)] ring-1 ring-slate-200 sm:p-12"
      >
        <div class="hero-glow"></div>
        <div class="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div class="space-y-8">
            <span class="hero-tag">Zintegrowany kalendarz</span>
            <div class="space-y-8 max-w-2xl hero-text">
              <h1 class="hero-title">
                Zaplanuj lekcje z nowoczesnym kalendarzem, który napędza Twój rytm pracy.
              </h1>
              <p class="hero-copy">
                Kalendarz Korker to intuicyjny pulpit dla korepetytorów. Przejrzysty widok
                dostępności, szybkie rezerwacje i inteligentne przypomnienia pomagają Ci prowadzić
                zajęcia sprawniej niż kiedykolwiek wcześniej.
              </p>
            </div>

            <div class="hero-actions flex flex-wrap gap-5 mt-8">
              <button class="btn-primary">Zaplanuj teraz</button>
              <button class="btn-secondary">Poznaj demo</button>
            </div>

            <div class="hero-pill-grid grid gap-5 sm:grid-cols-2">
              <article class="hero-pill">
                <span class="pill-icon">⏰</span>
                <div>
                  <h3>Sterowanie slotami</h3>
                  <p>Dodawaj i blokuj terminy jednym ruchem, aby utrzymać idealny grafik.</p>
                </div>
              </article>
              <article class="hero-pill">
                <span class="pill-icon">🔔</span>
                <div>
                  <h3>Powiadomienia w tle</h3>
                  <p>
                    Uczniowie otrzymują przypomnienia automatycznie, bez dodatkowej obsługi z Twojej
                    strony.
                  </p>
                </div>
              </article>
            </div>
          </div>

          <div class="calendar-preview">
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
                  <h3>Angielski — spotkanie online</h3>
                </article>
                <article class="event-card event-card--teal">
                  <p class="event-time">15:30 · 16:30</p>
                  <h3>Fizyka — powtórka</h3>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-12 grid gap-6 xl:grid-cols-4">
        <article class="metric-card metric-card--purple">
          <p class="metric-label">Zajęte sloty</p>
          <h3>18</h3>
          <p class="metric-copy">Monitoruj zapełnienie grafiku w czasie rzeczywistym.</p>
        </article>
        <article class="metric-card metric-card--sky">
          <p class="metric-label">Nowe rezerwacje</p>
          <h3>7</h3>
          <p class="metric-copy">Zobacz najnowsze rezerwacje i reaguj szybciej.</p>
        </article>
        <article class="metric-card metric-card--emerald">
          <p class="metric-label">Przypomnienia</p>
          <h3>24</h3>
          <p class="metric-copy">Przypomnienia wysyłane automatycznie do uczniów.</p>
        </article>
        <article class="metric-card metric-card--slate">
          <p class="metric-label">Oszczędność czasu</p>
          <h3>+32%</h3>
          <p class="metric-copy">Oszczędź nawet 32% czasu na organizację zajęć.</p>
        </article>
      </section>

      <section class="mt-12 grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
        <div
          class="feature-panel rounded-[32px] bg-white/95 p-8 shadow-[0_35px_80px_rgba(15,23,42,0.1)] ring-1 ring-slate-200"
        >
          <span class="hero-tag">Nowoczesne doświadczenie</span>
          <h2 class="feature-title">Kalendarz zaprojektowany dla nowoczesnych korepetytorów</h2>
          <p class="feature-copy">
            Wszystko, czego potrzebujesz do prowadzenia zajęć online i stacjonarnie.
            Spersonalizowane sloty, przejrzyste potwierdzenia i szybka zmiana terminów w kilku
            kliknięciach.
          </p>
          <div class="feature-list mt-8">
            <article class="feature-item">
              <span class="feature-icon">✅</span>
              <div>
                <h3>Pełny widok tygodnia</h3>
                <p>
                  Jeden panel pokazuje wszystkie nadchodzące lekcje i dostępne sloty w przejrzystej
                  formie.
                </p>
              </div>
            </article>
            <article class="feature-item">
              <span class="feature-icon">📍</span>
              <div>
                <h3>Online i stacjonarnie</h3>
                <p>
                  Uczniowie wybierają formę zajęć, a system aktualizuje dostępność w czasie
                  rzeczywistym.
                </p>
              </div>
            </article>
            <article class="feature-item">
              <span class="feature-icon">⚡</span>
              <div>
                <h3>Błyskawiczne potwierdzenia</h3>
                <p>Rezerwacje od razu trafiają do Twojego kalendarza i są komunikowane uczniowi.</p>
              </div>
            </article>
          </div>
        </div>

        <article
          class="schedule-panel relative overflow-hidden rounded-[32px] bg-slate-950 p-10 text-white shadow-[0_35px_90px_rgba(15,23,42,0.18)] ring-1 ring-slate-900"
        >
          <div class="schedule-deco"></div>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div class="schedule-header">
              <p class="schedule-pretitle">Nadchodzące sesje</p>
              <h3 class="schedule-title">Dzisiaj — plan Twoich spotkań</h3>
            </div>
            <div class="schedule-status-group flex flex-wrap gap-3">
              <span class="schedule-badge schedule-badge--confirmed">3 potwierdzone</span>
              <span class="schedule-badge schedule-badge--free">2 wolne sloty</span>
            </div>
          </div>

          <div
            class="schedule-timeline mt-8 rounded-[28px] bg-slate-900/90 p-6 ring-1 ring-white/10"
          >
            <div class="timeline-line"></div>

            <div class="schedule-item">
              <div class="schedule-item__marker"></div>
              <div class="schedule-item__body">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-semibold text-white">09:00 - 10:00</span>
                  <span class="session-tag">Matematyka</span>
                </div>
                <p class="mt-3 text-base font-semibold text-white">Anna Kowalska</p>
                <p class="mt-2 text-sm text-slate-400">
                  Sesja online potwierdzona, link wysłany do ucznia.
                </p>
              </div>
            </div>

            <div class="schedule-item">
              <div class="schedule-item__marker schedule-item__marker--active"></div>
              <div class="schedule-item__body">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-semibold text-white">15:30 - 16:30</span>
                  <span class="session-tag session-tag--sky">Fizyka</span>
                </div>
                <p class="mt-3 text-base font-semibold text-white">Marcin Nowak</p>
                <p class="mt-2 text-sm text-slate-400">
                  Lekcja zsynchronizowana z Twoim kalendarzem i gotowa do rozpoczęcia.
                </p>
              </div>
            </div>
          </div>
        </article>
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
  padding: 0.75rem 1.25rem;
  border-radius: 9999px;
  background: rgba(56, 189, 248, 0.12);
  color: #0f172a;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-title {
  margin: 0 0 0.9rem;
  font-size: clamp(2.5rem, 4vw, 4.4rem);
  line-height: 1.02;
  color: #0f172a;
}

.hero-copy {
  margin: 0 0 1.75rem;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.8;
}

.hero-text {
  display: grid;
  gap: 1.6rem;
}

.hero-actions {
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  min-width: 170px;
  padding: 0.95rem 1.5rem;
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
  box-shadow: 0 16px 40px rgba(37, 99, 235, 0.18);
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
  gap: 1rem;
  padding: 1rem 1.15rem;
  border-radius: 28px;
  background: #f8fbff;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.pill-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 18px;
  background: rgba(56, 189, 248, 0.12);
  color: #0ea5e9;
  font-size: 1.15rem;
}

.calendar-preview {
  position: relative;
}

.preview-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
}

.preview-label {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.preview-title {
  margin: 0.35rem 0 0;
  font-size: 1.75rem;
  color: #0f172a;
}

.preview-chip {
  display: inline-flex;
  padding: 0.65rem 0.95rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
  font-size: 0.85rem;
  font-weight: 700;
}

.preview-calendar {
  border-radius: 32px;
  padding: 1.9rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), #f8fbff 98%);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.06);
}

.weekday-row,
.slot-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
}

.weekday-row span,
.slot {
  display: grid;
  place-items: center;
  border-radius: 18px;
  padding: 0.85rem 0;
  background: #f8fbff;
  color: #475569;
  font-size: 0.85rem;
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
  margin-top: 1.75rem;
  display: grid;
  gap: 1.35rem;
}

.event-card {
  padding: 1rem 1.1rem;
  border-radius: 28px;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 16px 35px rgba(15, 23, 42, 0.05);
}

.event-card h3 {
  margin: 0.65rem 0 0;
  color: #0f172a;
  font-size: 1rem;
}

.event-time {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}

.event-card--blue {
  border-color: rgba(59, 130, 246, 0.2);
}

.event-card--purple {
  border-color: rgba(168, 85, 247, 0.18);
}

.event-card--teal {
  border-color: rgba(20, 184, 166, 0.18);
}

.metric-card {
  border-radius: 32px;
  padding: 1.9rem;
  background: white;
  box-shadow: 0 24px 65px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.metric-label {
  color: #64748b;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.metric-card h3 {
  margin: 0.85rem 0 0;
  font-size: 2rem;
  color: #0f172a;
}

.metric-copy {
  margin-top: 0.85rem;
  color: #475569;
  line-height: 1.75;
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

.metric-card--slate {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.feature-title {
  margin: 1rem 0 0;
  font-size: clamp(2.05rem, 2.4vw, 2.7rem);
  color: #0f172a;
}

.feature-copy {
  margin-top: 1rem;
  color: #475569;
  line-height: 1.85;
}

.feature-list {
  display: grid;
  gap: 1.4rem;
}

.feature-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  padding: 1.35rem 1.4rem;
  border-radius: 24px;
  background: #f8fbff;
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.feature-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
  font-size: 1.15rem;
}

.schedule-panel {
  position: relative;
  overflow: hidden;
}

.schedule-deco {
  position: absolute;
  top: -20px;
  right: -60px;
  width: 180px;
  height: 180px;
  background: rgba(59, 130, 246, 0.14);
  border-radius: 50%;
  filter: blur(24px);
}

.schedule-status-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.schedule-header {
  display: grid;
  gap: 0.45rem;
  margin-bottom: 1.1rem;
}

.schedule-pretitle {
  margin: 0;
  color: #94a3b8;
  font-size: 0.82rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.schedule-title {
  margin: 0;
  font-size: clamp(1.75rem, 2.5vw, 2.4rem);
  line-height: 1.05;
  font-weight: 800;
  color: #1e40af;
  text-shadow: 0 2px 10px rgba(30, 64, 175, 0.12);
}

.schedule-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.schedule-badge--confirmed {
  background: rgba(59, 130, 246, 0.18);
  color: #eff6ff;
}

.schedule-badge--free {
  background: rgba(14, 165, 233, 0.1);
  color: #0f172a;
}

.schedule-timeline {
  position: relative;
  display: grid;
  gap: 1.3rem;
}

.timeline-line {
  position: absolute;
  inset: 0;
  left: 24px;
  width: 2px;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.18), transparent 75%);
  opacity: 0.7;
}

.schedule-item {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  padding: 1.25rem 0;
}

.schedule-item__marker {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.35);
  border: 2px solid rgba(59, 130, 246, 0.9);
  margin-top: 6px;
}

.schedule-item__marker--active {
  background: #38bdf8;
  box-shadow: 0 0 0 6px rgba(56, 189, 248, 0.12);
}

.schedule-item__body {
  position: relative;
  padding-left: 0.65rem;
}

.schedule-item__body::before {
  content: '';
  position: absolute;
  left: -18px;
  top: 0.65rem;
  width: 10px;
  height: 2px;
  background: rgba(59, 130, 246, 0.18);
}

.session-card {
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.session-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.14);
}

.session-tag {
  display: inline-flex;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  font-size: 0.75rem;
  font-weight: 700;
}

.session-tag--sky {
  background: rgba(59, 130, 246, 0.14);
  color: #eff6ff;
}

@media (max-width: 1024px) {
  .hero-card {
    padding: 2rem;
  }

  .feature-title {
    font-size: 2.1rem;
  }
}

@media (max-width: 900px) {
  .hero-card,
  .feature-panel,
  .schedule-panel {
    border-radius: 30px;
  }
}

@media (max-width: 768px) {
  .hero-card {
    padding: 1.75rem;
  }

  .hero-title {
    font-size: 2.6rem;
  }

  .preview-calendar {
    padding: 1.25rem;
  }

  .weekday-row,
  .slot-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .hero-card {
    padding: 1.5rem;
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
