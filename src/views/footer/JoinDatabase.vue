<script setup></script>

<template>
  <main class="page-shell">
    <div class="page-container">
      <section class="hero-surface">
        <div class="hero-copy">
          <div class="eyebrow">Baza korepetytorów</div>
          <h1>
            Nie tylko zależy Ci na widoczności — zależy Ci na trafieniu do właściwych uczniów.
          </h1>
          <p>
            Otwieramy Ci drogę do osób, które szukają właśnie Ciebie: po przedmiocie, poziomie i
            miejscu.
          </p>

          <div class="hero-actions">
            <router-link to="/zostan-korepetytorem" class="primary-btn"> Załóż profil </router-link>
            <div class="support-pill">Działa jak dodatkowy zespół marketingowy</div>
          </div>
        </div>

        <div class="hero-panel">
          <div class="quote-card">
            <p class="quote-label">Dlaczego to działa</p>
            <blockquote>
              Uczniowie nie szukają „kogoś przypadkowego” — szukają kogoś, kto pasuje do ich tempa,
              celu i budżetu.
            </blockquote>
            <div class="stats-row">
              <div>
                <strong>3x</strong>
                <span>większa szansa na kontakt</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>widoczność w katalogu</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="info-grid">
        <article class="info-card">
          <h2>Precyzyjne dopasowanie</h2>
          <p>Twoje dane i oferta trafiają do uczniów, którzy szukają właśnie takiego wsparcia.</p>
        </article>
        <article class="info-card card-accent">
          <h2>Przejrzysty proces</h2>
          <p>Od profilu po pierwsze zapytanie — wszystko jest proste i uporządkowane.</p>
        </article>
        <article class="info-card">
          <h2>Więcej czasu na naukę</h2>
          <p>Nie musisz samodzielnie budować ruchu i opisywać siebie w każdej aplikacji.</p>
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
  background-color: var(--bg-color);
  background-image: linear-gradient(
    135deg,
    var(--surface-soft) 0%,
    var(--surface) 45%,
    var(--surface-strong) 100%
  );
  color: var(--text);
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
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-surface {
  display: grid;
  gap: 0.9rem;
  border-radius: 34px;
  padding: 1rem;
  background-color: var(--surface-strong);
  background-image: linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-soft) 100%);
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}

@media (min-width: 1024px) {
  .hero-surface {
    grid-template-columns: 1.2fr 0.8fr;
    align-items: stretch;
    padding: 2rem;
  }
}

.hero-copy {
  padding: 0.75rem;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--primary-color) 16%, transparent);
  color: var(--primary-color);
  padding: 0.45rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 1rem 0 0.9rem;
  font-size: clamp(1.9rem, 3.5vw, 2.8rem);
  line-height: 1.08;
  font-weight: 900;
  color: var(--text);
  letter-spacing: -0.02em;
}

.hero-copy p {
  max-width: 40rem;
  margin: 0;
  font-size: 1.03rem;
  line-height: 1.7;
  color: var(--muted);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.4rem;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--primary-color);
  color: #ffffff;
  padding: 0.85rem 1.1rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 12px 24px rgba(91, 120, 198, 0.2);
}

.support-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 0.7rem 1rem;
  font-size: 0.92rem;
  font-weight: 600;
}

.hero-panel {
  display: flex;
  align-items: stretch;
}

.quote-card {
  width: 100%;
  border-radius: 24px;
  padding: 1.25rem;
  background: linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-soft) 100%);
  color: var(--text);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
}

.quote-label {
  margin: 0 0 0.6rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary-color);
}

blockquote {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--muted);
}

.stats-row {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.stats-row > div {
  border-radius: 16px;
  padding: 0.8rem 0.9rem;
  background: var(--surface-soft);
  border: 1px solid var(--border);
}

.stats-row strong {
  display: block;
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
  color: var(--text);
}

.stats-row span {
  font-size: 0.9rem;
  color: var(--muted);
}

.info-grid {
  display: grid;
  gap: 1rem;
  margin-top: 0.3rem;
}

@media (min-width: 768px) {
  .info-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.info-card {
  border-radius: 22px;
  padding: 1.2rem;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
  color: var(--text);
}

.card-accent {
  background: linear-gradient(135deg, var(--surface-soft) 0%, var(--accent-soft) 100%);
  border-color: var(--border);
}

.info-card h2 {
  margin: 0 0 0.55rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
}

.info-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.info-card p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--muted);
}
</style>
