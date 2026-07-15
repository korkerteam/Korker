<template>
  <main class="info-shell">
    <section class="info-card">
      <div class="hero-block">
        <span class="eyebrow">Kalendarz i organizacja lekcji</span>
        <h1>Informacje o kalendarzu Korker</h1>
        <p>
          Ten ekran pokazuje, jak działa kalendarz dostępności, kiedy uczniowie mogą rezerwować
          lekcje oraz jak najlepiej przygotować swój plan zajęć.
        </p>
      </div>

      <div class="feature-grid">
        <article class="feature-card">
          <h2>Jak działa kalendarz</h2>
          <p>
            Kalendarz pomaga uporządkować Twoje dostępne terminy i pokazuje, które godziny są już
            zajęte, a które są jeszcze wolne.
          </p>
          <ul>
            <li>Widzisz swoje dostępne sloty czasowe.</li>
            <li>Uczniowie mogą wybierać terminy z Twojego planu.</li>
            <li>Każda rezerwacja jest od razu widoczna w systemie.</li>
          </ul>
        </article>

        <article class="feature-card">
          <h2>Co warto wiedzieć</h2>
          <p>
            Najlepiej ustawiać godziny regularnie, tak aby uczniowie mogli łatwo dopasować lekcje do
            swojego grafiku.
          </p>
          <ul>
            <li>Dodawaj dodatkowe terminy w weekendy i wieczory.</li>
            <li>Aktualizuj dostępność po każdej zmianie.</li>
            <li>Utrzymuj spójny harmonogram, aby ograniczyć konflikty.</li>
          </ul>
        </article>
      </div>

      <div class="tips-grid">
        <article class="tip-card">
          <h3>Przygotowanie planu</h3>
          <p>Zacznij od najczęściej wybieranych godzin i rozbudowuj kalendarz stopniowo.</p>
        </article>

        <article class="tip-card">
          <h3>Komunikacja z uczniami</h3>
          <p>Warto jasno oznaczać, czy lekcje odbywają się online czy stacjonarnie.</p>
        </article>

        <article class="tip-card">
          <h3>Elastyczność</h3>
          <p>Jeżeli masz zmienne zajęcia, aktualizuj terminy jak najszybciej po każdej zmianie.</p>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.info-shell {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 1.5rem 1rem 3rem;
}

.info-card {
  width: 100%;
  max-width: 1100px;
  border-radius: 32px;
  border: 1px solid var(--border);
  background: linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-soft) 100%);
  box-shadow: var(--shadow);
  padding: 2rem;
  color: var(--text);
}

.hero-block {
  margin-bottom: 1.75rem;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-block h1 {
  margin: 1rem 0 0.75rem;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1.15;
  font-weight: 900;
}

.hero-block p {
  margin: 0;
  max-width: 760px;
  line-height: 1.7;
  color: var(--muted);
  font-size: 1.02rem;
}

.feature-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 1.25rem;
}

.feature-card,
.tip-card {
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--surface-strong);
  padding: 1.35rem;
  box-shadow: var(--shadow-soft);
}

.feature-card h2,
.tip-card h3 {
  margin: 0 0 0.6rem;
  font-size: 1.1rem;
  font-weight: 800;
}

.feature-card p,
.tip-card p {
  margin: 0 0 0.8rem;
  line-height: 1.6;
  color: var(--muted);
}

.feature-card ul {
  margin: 0;
  padding-left: 1.15rem;
  color: var(--text);
  display: grid;
  gap: 0.45rem;
}

.tips-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 900px) {
  .feature-grid,
  .tips-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .info-card {
    padding: 1.25rem;
  }
}
</style>
