<template>
  <main class="pricing-page">
    <div class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Cennik</span>

        <h1 class="hero-title">
          Korzystanie z platformy Korker dla uczniów jest całkowicie bezpłatne.
        </h1>

        <p>
          Uczniowie korzystają za darmo z wyszukiwarki, czatu i kalendarza. Korepetytorzy decydują o
          swoich stawkach i wyborze modelu rozliczeń.
        </p>
      </div>

      <div class="hero-cards">
        <article class="preview-card">
          <div class="preview-card-icon">💎</div>
          <div class="preview-card-content">
            <h3>Przejrzystość w centrum</h3>
            <p>Wszystkie koszty są jasne, bez ukrytych opłat.</p>
          </div>
        </article>

        <article class="preview-card">
          <div class="preview-card-icon">🎓</div>
          <div class="preview-card-content">
            <h3>Uczniowie</h3>
            <p>Brak opłat za konto, wyszukiwanie i komunikację.</p>
          </div>
        </article>
      </div>
    </div>

    <section class="pricing-grid">
      <article class="pricing-card">
        <p class="pricing-label">Dla uczniów</p>
        <h2>0 PLN</h2>
        <p>
          Zakładanie konta i korzystanie z platformy jest darmowe. Płacisz tylko nauczycielowi za
          lekcje.
        </p>
      </article>

      <article class="pricing-card">
        <p class="pricing-label">Dla korepetytorów</p>
        <h2>Stawki indywidualne</h2>
        <p>Ustalasz cenę godzinową, a my wspieramy Cię prostą obsługą płatności i rezerwacji.</p>
      </article>
    </section>
  </main>
</template>

<style scoped>
.pricing-page {
  min-height: 100vh;
  padding: 48px 24px;
  background:
    radial-gradient(circle at top left, rgba(79, 117, 199, 0.14), transparent 24%),
    radial-gradient(circle at bottom right, rgba(82, 93, 225, 0.12), transparent 18%),
    var(--bg-color);
  color: var(--text);
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
  background: var(--accent-soft);
  color: var(--accent);
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
  color: var(--text);
}

.hero-copy p {
  margin: 0;
  max-width: 640px;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.85;
}

.hero-cards {
  display: grid;
  gap: 20px;
  padding: 30px;
  border-radius: 32px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
}

.preview-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
}

.preview-card-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 1.4rem;
}

.preview-card-content h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: var(--text);
}

.preview-card-content p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.75;
}

.pricing-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-card {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: 28px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
}

.pricing-label {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  margin: 0 0 16px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.pricing-card h2 {
  margin: 0 0 12px;
  font-size: 1.8rem;
  color: var(--text);
}

.pricing-card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.96rem;
  line-height: 1.75;
}

@media (max-width: 900px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .pricing-page {
    padding: 30px 18px;
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
