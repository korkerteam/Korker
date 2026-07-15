<script setup></script>

<template>
  <main class="page-shell">
    <div class="page-container">
      <section class="hero-surface">
        <div class="hero-copy">
          <div class="eyebrow">Centrum Pomocy Korker</div>
          <h1>Masz pytania? Znajdziesz tu wszystkie odpowiedzi.</h1>
          <p>Szybko znajdź pomoc, poradniki i odpowiedzi w jednym, przejrzystym miejscu.</p>
        </div>

        <div class="hero-panel">
          <div class="info-pill">
            <span class="info-icon">🛠️</span>
            <span>Pomoc dla uczniów i korepetytorów</span>
          </div>
        </div>
      </section>

      <section class="search-card">
        <div class="search-field">
          <input type="search" placeholder="Szukaj tematu pomocy..." />
          <span class="search-icon">🔎</span>
        </div>
      </section>

      <section class="cards-grid">
        <article class="info-card">
          <div class="icon-wrap">🎓</div>
          <h2>Dla Uczniów</h2>
          <p>Jak rezerwować lekcje, płatności i odwoływanie zajęć.</p>
        </article>

        <article class="info-card">
          <div class="icon-wrap">👩‍🏫</div>
          <h2>Dla Korepetytorów</h2>
          <p>Zarządzanie kalendarzem, cennik, profil i opinie.</p>
        </article>

        <article class="info-card">
          <div class="icon-wrap">🖥️</div>
          <h2>Kwestie Techniczne</h2>
          <p>Konto, czat, powiadomienia i lekcje online.</p>
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
  background-color: var(--surface-strong);
  background-image: linear-gradient(
    135deg,
    var(--surface-strong) 0%,
    var(--surface-soft) 50%,
    var(--surface) 100%
  );
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
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
  background: var(--accent-soft);
  color: var(--accent-strong);
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
  color: var(--text);
  letter-spacing: -0.02em;
}

.hero-copy p {
  margin: 0;
  max-width: 40rem;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--muted);
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
  background: var(--surface-soft);
  border: 1px solid var(--border);
  padding: 0.7rem 1rem;
  color: var(--text);
  font-weight: 600;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.search-card {
  margin-top: 0.75rem;
  border-radius: 22px;
  padding: 0.9rem;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
}

.search-field {
  position: relative;
}

.search-field input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 9999px;
  padding: 0.85rem 3rem 0.85rem 1rem;
  font-size: 0.95rem;
  color: var(--text);
  background: var(--surface-soft);
  outline: none;
}

.search-field input:focus {
  border-color: var(--accent-strong);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent-strong);
}

.cards-grid {
  display: grid;
  gap: 0.9rem;
  margin-top: 0.75rem;
}

@media (min-width: 900px) {
  .cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.info-card {
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface-strong);
  padding: 1rem;
  box-shadow: var(--shadow-soft);
}

.icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 14px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 1.1rem;
}

.info-card h2 {
  margin: 0.8rem 0 0.35rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
}

.info-card p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--muted);
}
</style>
