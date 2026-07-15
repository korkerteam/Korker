<script setup></script>

<template>
  <main class="page-shell">
    <div class="page-container">
      <section class="hero-surface">
        <div class="hero-accent"></div>

        <div class="hero-grid">
          <div class="hero-text-card">
            <div class="text-content">
              <div class="badge">
                <span class="badge-icon">✦</span>
                <span class="badge-text">Dlaczego warto uczyć z Korker?</span>
              </div>

              <h1 class="main-title">Narzędzia stworzone specjalnie po to, by ułatwić Ci pracę.</h1>

              <p class="main-description">
                Korker wspiera korepetytorów w organizacji pracy, komunikacji i w budowaniu silnej
                marki wśród uczniów.
              </p>
            </div>

            <div class="feature-pill-row">
              <div class="feature-pill">Elastyczny grafik</div>
              <div class="feature-pill">Autorezerwacje</div>
            </div>
          </div>

          <div class="benefits-card">
            <div class="benefits-card-head">
              <div>
                <p class="benefits-label">Praca w jednym miejscu</p>
                <h2 class="benefits-title">Wszystko, czego potrzebujesz, w jednym środowisku.</h2>
              </div>
              <span class="benefits-badge">Nowoczesne narzędzia</span>
            </div>

            <div class="benefits-list">
              <article class="benefit-item">
                <span class="benefit-icon">🕒</span>
                <div>
                  <h3 class="benefit-title-small">Elastyczny grafik</h3>
                  <p class="benefit-description">
                    Działaj w godzinach, które Ci odpowiadają, i miej pełen porządek w kalendarzu.
                  </p>
                </div>
              </article>

              <article class="benefit-item">
                <span class="benefit-icon">📅</span>
                <div>
                  <h3 class="benefit-title-small">Automatyzacja rezerwacji</h3>
                  <p class="benefit-description">
                    Uczniowie sami podglądają dostępność i rezerwują zajęcia bez dodatkowych rozmów.
                  </p>
                </div>
              </article>

              <article class="benefit-item">
                <span class="benefit-icon">💬</span>
                <div>
                  <h3 class="benefit-title-small">Wbudowany komunikator</h3>
                  <p class="benefit-description">
                    Kontaktuj się w bezpiecznym czacie bez konieczności wymiany numerów.
                  </p>
                </div>
              </article>

              <article class="benefit-item">
                <span class="benefit-icon">🏆</span>
                <div>
                  <h3 class="benefit-title-small">Budowanie marki</h3>
                  <p class="benefit-description">
                    Zbieraj opinie i zwiększaj swoją widoczność wśród najlepszych korepetytorów.
                  </p>
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
.page-shell {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 1rem 0.2rem;
  background: linear-gradient(135deg, #f8fbff 0%, #eef7ff 45%, #fdfefe 100%);
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
  position: relative;
  overflow: hidden;
  border-radius: 30px;
  padding: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #f7fbff 50%, #eef8ff 100%);
  box-shadow: 0 28px 80px rgba(2, 6, 23, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.hero-accent {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(2, 132, 199, 0.22), transparent 32%),
    radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.16), transparent 24%);
  pointer-events: none;
}

.hero-grid {
  position: relative;
  z-index: 10;
  display: grid;
  gap: 0.9rem;
}

@media (min-width: 1024px) {
  .hero-surface {
    padding: 1.25rem;
  }

  .hero-grid {
    grid-template-columns: 1.05fr 0.95fr;
    align-items: stretch;
  }
}

.hero-text-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 22px;
  background: #ffffff;
  padding: 1.4rem;
  box-shadow: 0 16px 44px rgba(2, 6, 23, 0.07);
}

.text-content {
  text-align: center;
}

@media (min-width: 1024px) {
  .text-content {
    text-align: left;
  }
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  background-color: #0284c7;
  padding: 0.5rem 1rem;
  color: #ffffff;
}

.badge-icon {
  font-size: 0.85rem;
}

.badge-text {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.main-title {
  margin: 1.5rem 0 1rem;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.main-description {
  margin: 0 auto;
  max-width: 36rem;
  font-size: 1.05rem;
  line-height: 1.7;
  color: #334155;
}

@media (min-width: 1024px) {
  .main-description {
    margin: 0;
  }
}

.feature-pill-row {
  margin-top: 1.2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

@media (min-width: 1024px) {
  .feature-pill-row {
    justify-content: flex-start;
  }
}

.feature-pill {
  border-radius: 9999px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  padding: 0.7rem 1rem;
  font-weight: 600;
  color: #0f172a;
}

.benefits-card {
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: linear-gradient(135deg, #0f172a 0%, #111c33 100%);
  padding: 1.25rem;
  color: #ffffff;
}

.benefits-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.benefits-label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #38bdf8;
}

.benefits-title {
  margin: 0.5rem 0 0;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
}

.benefits-badge {
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  color: #bae6fd;
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  white-space: nowrap;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.benefit-item {
  display: flex;
  gap: 0.9rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  padding: 0.9rem;
}

.benefit-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.benefit-title-small {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.benefit-description {
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #94a3b8;
}
</style>
