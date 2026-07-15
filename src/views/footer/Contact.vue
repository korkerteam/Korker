<script setup>
import { ref } from 'vue'

const form = ref({ name: '', email: '', subject: '', message: '' })

const handleSubmit = () => {
  // Ta funkcja można rozszerzyć o logikę wysyłki formularza.
  alert('Wiadomość została wysłana!')
  form.name = ''
  form.email = ''
  form.subject = ''
  form.message = ''
}
</script>

<template>
  <main class="page-shell">
    <div class="page-container">
      <section class="hero-surface">
        <div class="hero-copy">
          <div class="eyebrow">Skontaktuj się z nami</div>
          <h1>Masz pytania, uwagi lub potrzebujesz pomocy technicznej? Napisz do nas!</h1>
          <p>
            Nasz zespół wsparcia jest gotowy, by pomóc w kwestiach związanych z kontem, czatem,
            lekcjami i płatnościami.
          </p>
        </div>

        <div class="hero-panel">
          <div class="info-pill">
            <span class="info-icon">📬</span>
            <span>Odpowiadamy szybko i sprawnie</span>
          </div>
        </div>
      </section>

      <section class="content-grid">
        <form class="contact-form" @submit.prevent="handleSubmit">
          <div class="field-row">
            <label>
              Imię i nazwisko
              <input v-model="form.name" type="text" placeholder="Jan Kowalski" />
            </label>
            <label>
              Adres E-mail
              <input v-model="form.email" type="email" placeholder="kontakt@domena.pl" />
            </label>
          </div>

          <label class="full-width">
            Temat wiadomości
            <input v-model="form.subject" type="text" placeholder="Np. problem z czatem" />
          </label>

          <label class="full-width">
            Treść wiadomości
            <textarea
              v-model="form.message"
              rows="6"
              placeholder="Opisz swoją sprawę..."
            ></textarea>
          </label>

          <button type="submit">Wyślij wiadomość</button>
        </form>

        <aside class="contact-card">
          <div class="icon-wrap">📬</div>
          <div>
            <h2>Dane kontaktowe</h2>
            <p class="contact-value">kontakt@korker.pl</p>
          </div>
          <div>
            <h3>Godziny pracy wsparcia</h3>
            <p>Pon - Pt: 9:00 - 17:00</p>
          </div>
        </aside>
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

.content-grid {
  display: grid;
  gap: 0.9rem;
  margin-top: 0.75rem;
}

@media (min-width: 900px) {
  .content-grid {
    grid-template-columns: 1.2fr 0.8fr;
    align-items: start;
  }
}

.contact-form {
  border-radius: 22px;
  border: 1px solid var(--border);
  background: var(--surface-strong);
  padding: 1rem;
  box-shadow: var(--shadow-soft);
}

.field-row {
  display: grid;
  gap: 0.8rem;
}

@media (min-width: 700px) {
  .field-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text);
}

.full-width {
  margin-top: 0.8rem;
}

input,
textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 0.8rem 0.9rem;
  font-size: 0.95rem;
  color: var(--text);
  background: var(--surface-soft);
  outline: none;
}

input:focus,
textarea:focus {
  border-color: var(--accent-strong);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

button {
  margin-top: 0.9rem;
  border: 0;
  border-radius: 9999px;
  background: linear-gradient(135deg, var(--accent-strong) 0%, var(--accent) 100%);
  color: #ffffff;
  padding: 0.85rem 1.1rem;
  font-weight: 700;
  cursor: pointer;
}

.contact-card {
  border-radius: 22px;
  border: 1px solid var(--border);
  background: linear-gradient(135deg, var(--surface-soft) 0%, var(--accent-soft) 100%);
  padding: 1rem;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 16px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 1.1rem;
}

.contact-card h2,
.contact-card h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}

.contact-value,
.contact-card p {
  margin: 0.2rem 0 0;
  color: var(--muted);
  line-height: 1.6;
}
</style>
