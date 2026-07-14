<template>
  <div class="home-shell">
    <div class="dashboard-top">
      <div>
        <p class="dashboard-welcome">Witamy w Korker</p>
        <h2 class="dashboard-title">Znajdź korepetytora w kilka sekund</h2>
      </div>
      <div class="dashboard-actions">
        <button class="dashboard-action">Najbliższe lekcje</button>
        <button class="dashboard-action">Powiadomienia</button>
      </div>
    </div>

    <div class="dashboard-grid">
      <article class="dashboard-card">
        <h3>Najbliższe lekcje</h3>
        <ul>
          <li>
            <strong>Matematyka z Anna Kowalską</strong>
            <span>Dziś 16:00</span>
          </li>
          <li>
            <strong>Matematyka z Anna Kowalską</strong>
            <span>Dziś 16:00</span>
          </li>
        </ul>
      </article>

      <article class="dashboard-card">
        <h3>Polecani nauczyciele</h3>
        <p>Sprawdź nauczycieli dopasowanych do Twoich filtrów i preferencji.</p>
      </article>

      <article class="dashboard-card">
        <h3>Ostatnie wiadomości</h3>
        <p>Przeglądaj ostatnie rozmowy i informacje od nauczycieli.</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.home-shell {
  display: grid;
  gap: 24px;
  width: 100%;
  min-height: 100%;
}

.dashboard-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 26px 28px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.dashboard-welcome {
  margin: 0 0 6px;
  color: #4f75c7;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.dashboard-title {
  margin: 0;
  font-size: clamp(24px, 2.2vw, 32px);
  line-height: 1.1;
  color: #0f172a;
}

.dashboard-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.dashboard-action {
  border: none;
  border-radius: 16px;
  background: #2563eb;
  color: white;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.dashboard-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(37, 99, 235, 0.18);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 26px;
  padding: 24px;
  box-shadow: 0 22px 40px rgba(15, 23, 42, 0.07);
}

.dashboard-card h3 {
  margin: 0 0 14px;
  font-size: 18px;
  color: #0f172a;
}

.dashboard-card p,
.dashboard-card span {
  color: #475569;
  font-size: 14px;
}

.dashboard-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 14px;
}

.dashboard-card li {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.dashboard-card li:last-child {
  border-bottom: none;
}

.dashboard-card strong {
  color: #111827;
}
</style>
