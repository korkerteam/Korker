<script setup>
import { ref } from 'vue'

const faqs = ref([
  {
    question: 'Czy rejestracja i posiadanie profilu jest płatne?',
    answer: 'Nie, rejestracja i podstawowe konto korepetytora są całkowicie darmowe.',
    open: true,
  },
  {
    question: 'Jak rozliczam się z uczniami?',
    answer:
      'Rozliczenia mogą odbywać się bezpośrednio między Tobą a uczniem (gotówka, przelew, Blik) lub za pośrednictwem bezpiecznych płatności online na naszej platformie.',
    open: false,
  },
  {
    question: 'Jak działa kalendarz?',
    answer:
      'W panelu korepetytora zaznaczasz godziny, w których jesteś dostępny. Uczniowie mogą rezerwować tylko te wskazane przez Ciebie terminy.',
    open: false,
  },
])

const toggleFAQ = (index) => {
  faqs.value[index].open = !faqs.value[index].open
}
</script>

<template>
  <main class="page-shell">
    <div class="page-container">
      <section class="hero-surface">
        <div class="hero-copy">
          <div class="eyebrow">FAQ dla korepetytorów</div>
          <h1>Najczęściej zadawane pytania przez nauczycieli</h1>
          <p>
            Znajdź szybkie odpowiedzi na pytania o rejestrację, rozliczenia i obsługę kalendarza
            Korker.
          </p>
        </div>

        <div class="hero-panel">
          <div class="info-pill">
            <span class="info-icon">❓</span>
            <span>Info w przejrzystej formie</span>
          </div>
        </div>
      </section>

      <section class="faq-list">
        <article v-for="(faq, index) in faqs" :key="faq.question" class="faq-card">
          <button type="button" @click="toggleFAQ(index)" class="faq-trigger">
            <span class="faq-question">{{ faq.question }}</span>
            <span class="faq-toggle" :class="{ open: faq.open }">
              <span v-if="faq.open">−</span>
              <span v-else>+</span>
            </span>
          </button>
          <div v-if="faq.open" class="faq-answer">
            {{ faq.answer }}
          </div>
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

.faq-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.faq-card {
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface-strong);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.faq-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 0;
  background: transparent;
  padding: 1rem 1.1rem;
  text-align: left;
  cursor: pointer;
}

.faq-question {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}

.faq-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 1rem;
  flex-shrink: 0;
}

.faq-toggle.open {
  background: var(--accent-strong);
  color: #ffffff;
}

.faq-answer {
  padding: 0 1.1rem 1rem;
  color: var(--muted);
  line-height: 1.7;
}
</style>
