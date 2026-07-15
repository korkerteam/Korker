<template>
  <main class="page-shell">
    <div class="page-container">
      <section class="hero-surface">
        <div class="hero-copy">
          <div class="eyebrow">Zintegrowany kalendarz</div>
          <h1>Zaplanuj lekcje bez zbędnego zamieszania.</h1>
          <p>
            Kalendarz Korker pomaga korepetytorom szybko ustalać terminy, sprawdzać dostępność i
            wysyłać przypomnienia bez chaosu.
          </p>
        </div>

        <div class="hero-panel">
          <div class="info-pill">
            <span class="info-icon">📅</span>
            <span>Przejrzysty podgląd tygodnia</span>
          </div>
        </div>
      </section>

      <section class="content-stack">
        <article class="content-card">
          <h2>Szybkie sloty</h2>
          <p>Dodawaj i blokuj terminy bez zbędnych kliknięć, a wszystko jest od razu widoczne.</p>
        </article>

        <article class="content-card">
          <h2>Przypomnienia</h2>
          <p>Uczniowie dostają automatyczne informacje o nadchodzących lekcjach i zmianach.</p>
        </article>

        <article class="content-card">
          <h2>Online i stacjonarnie</h2>
          <p>
            Wybierasz format zajęć, a system odpowiada zgodnie z Twoją dostępnością i preferencjami.
          </p>
        </article>

        <article class="content-card">
          <h2>Pełen przegląd tygodnia</h2>
          <p>Widok zajęć jest przejrzysty, szybki i ułatwia codzienną organizację pracy.</p>
        </article>
      </section>
    </div>
  </main>
</template>

<style scoped>
.page-shell {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 1rem 0.2rem;
  background: linear-gradient(135deg, #fdfefe 0%, #f2f8ff 45%, #f7fbff 100%);
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    sans-serif;
  box-sizing: border-box;
}

.page-container {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-surface {
  display: grid;
  gap: 1rem;
  border-radius: 30px;
  padding: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #f7fbff 50%, #eef8ff 100%);
  box-shadow: 0 28px 80px rgba(2, 6, 23, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

@media (min-width: 900px) {
  .hero-surface {
    grid-template-columns: 1.2fr 0.8fr;
    align-items: center;
    padding: 1.25rem;
  }
}

.hero-copy {
  padding: 0.5rem;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.45rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 1rem 0 0.8rem;
  font-size: clamp(1.8rem, 3.2vw, 2.6rem);
  line-height: 1.08;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.hero-copy p {
  margin: 0;
  max-width: 40rem;
  font-size: 1rem;
  line-height: 1.7;
  color: #475569;
}

.hero-panel {
  display: flex;
  justify-content: flex-start;
}

.info-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 9999px;
  background: #f8fafc;
  border: 1px solid #dbeafe;
  padding: 0.7rem 1rem;
  color: #334155;
  font-weight: 600;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #e0f2fe;
  color: #0369a1;
}

.content-stack {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.content-card {
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  padding: 1rem;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
}

.content-card h2 {
  margin: 0 0 0.45rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.content-card p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #475569;
}
</style>
