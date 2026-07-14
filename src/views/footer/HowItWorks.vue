<template>
  <main class="how-it-works-page">
    <div class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Jak działa Korker?</span>

        <h1 class="hero-title">Znajdź korepetytora, porozmawiaj, zarezerwuj lekcję.</h1>

        <p>
          Korker łączy uczniów z najlepszymi korepetytorami. Szybki czat, wygodny kalendarz i prosty
          proces rezerwacji sprawiają, że zaczęcie nauki jest szybkie i wygodne.
        </p>
      </div>

      <div class="hero-cards">
        <article class="preview-card">
          <div class="preview-card-icon">🔍</div>
          <div class="preview-card-content">
            <h3>Szybkie dopasowanie</h3>
            <p>Wybieraj nauczycieli według przedmiotu, lokalizacji i dostępności.</p>
          </div>
        </article>

        <article class="preview-card">
          <div class="preview-card-icon">💬</div>
          <div class="preview-card-content">
            <h3>Bezpośredni czat</h3>
            <p>Ustal szczegóły zajęć z korepetytorem zanim zarezerwujesz termin.</p>
          </div>
        </article>
      </div>
    </div>

    <section class="steps">
      <div class="section-head">
        <h2>W 4 krokach do pierwszej lekcji</h2>
        <p>Prosty i intuicyjny proces krok po kroku, zaprojektowany z myślą o szybkim starcie.</p>
      </div>

      <div class="step-grid">
        <article class="step-card">
          <div class="step-badge">01</div>
          <h3>Wyszukaj korepetytora</h3>
          <p>
            Przeglądaj profile nauczycieli i wybierz osobę najlepiej dopasowaną do Twoich potrzeb.
          </p>
        </article>

        <article class="step-card">
          <div class="step-badge">02</div>
          <h3>Porozmawiaj</h3>
          <p>
            Skontaktuj się z korepetytorem przez czat i uzyskaj szybkie odpowiedzi na swoje pytania.
          </p>
        </article>

        <article class="step-card">
          <div class="step-badge">03</div>
          <h3>Zarezerwuj termin</h3>
          <p>Wybierz dogodny termin, formę zajęć i zamów lekcję w kilku kliknięciach.</p>
        </article>

        <article class="step-card">
          <div class="step-badge">04</div>
          <h3>Rozwijaj się</h3>
          <p>
            Ucz się regularnie i śledź postępy z systemem, który wspiera zarówno uczniów, jak i
            nauczycieli.
          </p>
        </article>
      </div>
    </section>
  </main>
</template>
<style scoped>
.how-it-works-page {
  min-height: 100vh;
  padding: 48px 24px;
  background:
    radial-gradient(circle at top left, rgba(79, 117, 199, 0.14), transparent 24%),
    radial-gradient(circle at bottom right, rgba(82, 93, 225, 0.12), transparent 18%), #f8fbff;
}

.hero {
  display: grid;
  gap: 28px;
  max-width: 1200px;
  margin: 0 auto 40px;
}

.hero-copy {
  display: grid;
  gap: 22px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  background: rgba(79, 117, 199, 0.12);
  color: #3366ff;
  font-size: 0.82rem;
  font-weight: 700;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.hero-title {
  margin: 0;
  font-size: clamp(2.4rem, 4vw, 4.2rem);
  line-height: 1.02;
  color: #0f172a;
}

.hero-copy p {
  margin: 0;
  max-width: 640px;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.85;
}

.hero-cards {
  display: grid;
  gap: 20px;
  padding: 30px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.08);
}

.preview-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 24px;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.preview-card-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: rgba(79, 117, 199, 0.1);
  color: #3366ff;
  font-size: 1.4rem;
}

.preview-card-content h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.preview-card-content p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.75;
}

.steps {
  max-width: 1200px;
  margin: 0 auto;
}

.section-head {
  text-align: center;
  margin-bottom: 26px;
}

.section-head h2 {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.4rem);
  color: #0f172a;
}

.section-head p {
  margin: 14px auto 0;
  max-width: 640px;
  color: #64748b;
  font-size: 1rem;
  line-height: 1.8;
}

.step-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.step-card {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: 28px;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.step-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.14);
}

.step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(79, 117, 199, 0.1);
  color: #3366ff;
  border-radius: 16px;
  font-weight: 800;
  margin-bottom: 18px;
}

.step-card h3 {
  margin: 0 0 12px;
  font-size: 1.05rem;
  color: #0f172a;
}

.step-card p {
  margin: 0;
  color: #64748b;
  font-size: 0.96rem;
  line-height: 1.75;
}

@media (max-width: 1080px) {
  .step-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .how-it-works-page {
    padding: 30px 18px;
  }

  .step-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .preview-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .preview-card-icon {
    width: 48px;
    height: 48px;
  }
}
</style>
