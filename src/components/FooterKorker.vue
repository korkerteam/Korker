<template>
  <footer class="footer">
    <div class="footer__container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a href="/" class="footer__logo">Korker</a>
          <p class="footer__description">
            Korker pomaga uczniom znaleźć idealnego korepetytora w kilka sekund. Z nami umówisz
            lekcje online lub stacjonarnie i wygodnie zaplanujesz je w kalendarzu.
          </p>
        </div>

        <div class="footer__column">
          <h3 class="footer__heading">Dla uczniów</h3>
          <ul class="footer__links">
            <li><a href="/find-tutor">Znajdź korepetytora</a></li>
            <li><a href="/how-it-works">Jak to działa</a></li>
            <li><a href="/calendar">Zintegrowany kalendarz</a></li>
            <li><a href="/pricing">Cennik</a></li>
          </ul>
        </div>

        <div class="footer__column">
          <h3 class="footer__heading">Dla korepetytorów</h3>
          <ul class="footer__links">
            <li><a href="/become-a-tutor">Zostań korepetytorem</a></li>
            <li><a href="/benefits">Korzyści dla korepetytorów</a></li>
            <li><a href="/join-database">Dołącz do bazy</a></li>
            <li><a href="/tutor-faq">FAQ dla korepetytorów</a></li>
          </ul>
        </div>

        <div class="footer__column">
          <h3 class="footer__heading">Kontakt i wsparcie</h3>
          <ul class="footer__links">
            <li><a href="/help-center">Centrum pomocy</a></li>
            <li><a href="/contact">Kontakt</a></li>
            <li><a href="/terms">Regulamin</a></li>
            <li><a href="/privacy">Polityka prywatności</a></li>
          </ul>
        </div>
      </div>

      <div class="footer__bottom">
        <p class="footer__copyright">© 2026 Korker. Wszelkie prawa zastrzeżone.</p>
        <div class="footer__socials" aria-label="Media społecznościowe">
          <a href="#" class="footer__social" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M22 12a10 10 0 10-11.53 9.87v-6.99h-2.14v-2.88h2.14V9.41c0-2.11 1.26-3.28 3.18-3.28.92 0 1.89.16 1.89.16v2.08h-1.07c-1.06 0-1.39.66-1.39 1.34v1.61h2.37l-.38 2.88h-1.99V22A10 10 0 0022 12z"
              />
            </svg>
          </a>
          <a href="#" class="footer__social" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm8.75 2.5a.75.75 0 110 1.5.75.75 0 010-1.5zm-4.25 1.25a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5zm0 1.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"
              />
            </svg>
          </a>
          <a href="#" class="footer__social" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M4.98 3.5a2.49 2.49 0 100 4.98 2.49 2.49 0 000-4.98zM3 8.93h3.95V21H3V8.93zm7.55 0h3.79v1.64h.05a4.17 4.17 0 013.75-2.06c4.01 0 4.75 2.64 4.75 6.07V21h-3.95v-5.3c0-1.26-.02-2.88-1.76-2.88-1.76 0-2.03 1.37-2.03 2.79V21h-3.95V8.93z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #f8fafc;
  color: #0f172a;
  border-top: 1px solid #e2e8f0;
}

.footer__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 14px 14px;
}

.footer__grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1.1fr repeat(3, minmax(0, 1fr));
}

.footer__brand {
  max-width: 220px;
}

.footer__logo {
  display: inline-flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
  text-decoration: none;
}

.footer__description {
  margin-top: 8px;
  line-height: 1.5;
  color: #475569;
  font-size: 0.86rem;
}

.footer__column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer__heading {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #0f172a;
}

.footer__links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.footer__links a {
  color: #475569;
  text-decoration: none;
  font-size: 0.84rem;
  transition: color 0.2s ease;
}

.footer__links a:hover {
  color: #0f172a;
}

.footer__bottom {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  padding-top: 14px;
}

.footer__copyright {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
}

.footer__socials {
  display: flex;
  gap: 10px;
}

.footer__social {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.footer__social:hover {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #0f172a;
}

.footer__social svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 1024px) {
  .footer__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .footer__container {
    padding: 18px 14px 14px;
  }

  .footer__grid {
    grid-template-columns: 1fr;
  }

  .footer__bottom {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .footer__container {
    padding: 16px 12px 12px;
  }

  .footer__social {
    width: 32px;
    height: 32px;
  }
}
</style>
