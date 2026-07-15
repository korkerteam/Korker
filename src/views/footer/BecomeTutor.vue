<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth.js'

const { isAuthenticated, openAuthModal } = useAuth()
const accountMessage = ref('')

function handleCreateAccount() {
  if (isAuthenticated.value) {
    accountMessage.value = 'Masz już konto — możesz przejść dalej i uzupełnić profil.'
    return
  }

  accountMessage.value = ''
  openAuthModal()
}
</script>

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
                <span class="badge-text">Zacznij uczyć na Korker</span>
              </div>

              <h1 class="main-title">Zostań nauczycielem, który buduje prawdziwą markę online.</h1>

              <p class="main-description">
                Przyjmuj uczniów, prowadź lekcje i rozwijaj swój biznes w środowisku, które wygląda
                profesjonalnie i działa jeszcze lepiej.
              </p>
            </div>

            <div class="button-group">
              <button class="btn btn-dark" type="button" @click="handleCreateAccount">
                Załóż konto
              </button>
              <button class="btn btn-outline" type="button">Sprawdź jak to działa</button>
            </div>
            <p v-if="accountMessage" class="account-message">{{ accountMessage }}</p>
          </div>

          <div class="steps-card">
            <div class="steps-header">
              <div>
                <p class="steps-subtitle">Rozpocznij w 4 krokach</p>
                <h2 class="steps-title">
                  Prosty proces od pierwszego kontaktu do pierwszej lekcji.
                </h2>
              </div>
              <span class="steps-badge">4 kroki</span>
            </div>

            <div class="steps-list">
              <div class="step-item">
                <div class="step-num">01</div>
                <h3 class="step-heading">Zarejestruj konto</h3>
                <p class="step-description">
                  Stwórz darmowe konto i uzupełnij podstawowe informacje.
                </p>
              </div>

              <div class="step-item">
                <div class="step-num">02</div>
                <h3 class="step-heading">Uzupełnij profil</h3>
                <p class="step-description">
                  Dodaj przedmioty, stawki i lokalizację, aby być lepiej widocznym.
                </p>
              </div>

              <div class="step-item">
                <div class="step-num">03</div>
                <h3 class="step-heading">Ustaw dostępność</h3>
                <p class="step-description">Wybierz godziny, w których chcesz prowadzić lekcje.</p>
              </div>

              <div class="step-item">
                <div class="step-num">04</div>
                <h3 class="step-heading">Odbieraj rezerwacje</h3>
                <p class="step-description">
                  Otrzymuj wiadomości od uczniów i potwierdzaj terminy bezpośrednio na platformie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="benefits-grid">
        <article class="benefit-card">
          <p class="benefit-tag">Szybki start</p>
          <h3 class="benefit-title">Zacznij już dziś</h3>
          <p class="benefit-description">
            Utwórz profil i zacznij odbierać zgłoszenia od uczniów w kilka minut.
          </p>
        </article>

        <article class="benefit-card">
          <p class="benefit-tag">Profesjonalna komunikacja</p>
          <h3 class="benefit-title">Bez zbędnych komplikacji</h3>
          <p class="benefit-description">
            Wszystko jest uporządkowane w jednym miejscu: wiadomości, terminy i rezerwacje.
          </p>
        </article>

        <article class="benefit-card">
          <p class="benefit-tag">Więcej zysków</p>
          <h3 class="benefit-title">Buduj swoją przewagę</h3>
          <p class="benefit-description">
            Zyskuj nowych uczniów, buduj reputację i rozwijaj swoje lekcje skutecznie.
          </p>
        </article>
      </section>
    </div>
  </main>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  padding: 3rem 1rem;
  background: linear-gradient(
    135deg,
    var(--bg-color) 0%,
    var(--surface-soft) 45%,
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
}

.hero-surface {
  position: relative;
  overflow: hidden;
  border-radius: 32px;
  padding: 1.5rem;
  background: linear-gradient(
    135deg,
    var(--surface-strong) 0%,
    var(--surface-soft) 50%,
    var(--surface) 100%
  );
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
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
  gap: 2rem;
}

@media (min-width: 1024px) {
  .hero-surface {
    padding: 2.5rem;
  }

  .hero-grid {
    grid-template-columns: 1.15fr 0.85fr;
  }
}

.hero-text-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 24px;
  background: var(--surface-strong);
  padding: 2rem;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
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
  background-color: var(--accent);
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
  margin: 1.5rem 0 1.25rem 0;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text);
}

.main-description {
  margin: 0 auto;
  max-width: 36rem;
  font-size: 1.05rem;
  line-height: 1.65;
  color: var(--muted);
}

@media (min-width: 1024px) {
  .main-description {
    margin: 0;
  }
}

.button-group {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.account-message {
  margin-top: 1rem;
  font-size: 0.95rem;
  color: var(--accent-strong);
  font-weight: 600;
}

@media (min-width: 1024px) {
  .button-group {
    justify-content: flex-start;
  }
}

.btn {
  padding: 0.9rem 1.5rem;
  font-weight: 600;
  border-radius: 9999px;
  cursor: pointer;
  transition:
    transform 0.2s,
    background-color 0.2s;
  border: none;
  font-size: 0.95rem;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-dark {
  background-color: #0f172a;
  color: #ffffff;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.25);
}

.btn-dark:hover {
  background-color: #1e293b;
}

.btn-outline {
  background-color: var(--surface-strong);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-outline:hover {
  background-color: var(--surface-soft);
}

.steps-card {
  border-radius: 24px;
  border: 1px solid var(--border);
  background: linear-gradient(to bottom right, #020617, #0f172a);
  padding: 1.75rem;
  color: #ffffff;
}

.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.steps-subtitle {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #38bdf8;
}

.steps-title {
  margin: 0.5rem 0 0 0;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
}

.steps-badge {
  background-color: rgba(255, 255, 255, 0.1);
  color: #bae6fd;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  white-space: nowrap;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-item {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background-color: rgba(255, 255, 255, 0.04);
  padding: 1.25rem;
}

.step-num {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #38bdf8;
}

.step-heading {
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
  font-weight: 600;
}

.step-description {
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #94a3b8;
}

.benefits-grid {
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .benefits-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.benefit-card {
  border-radius: 20px;
  border: 1px solid var(--border);
  background-color: var(--surface-strong);
  padding: 1.5rem;
  box-shadow: var(--shadow-soft);
}

.benefit-tag {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--accent);
}

.benefit-title {
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
}

.benefit-description {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--muted);
}
</style>
