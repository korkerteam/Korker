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

.faq-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.faq-card {
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
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
  color: #0f172a;
}

.faq-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 1rem;
  flex-shrink: 0;
}

.faq-toggle.open {
  background: #0369a1;
  color: #ffffff;
}

.faq-answer {
  padding: 0 1.1rem 1rem;
  color: #475569;
  line-height: 1.7;
}
</style>
