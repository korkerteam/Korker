<script setup></script>

<template>
  <form class="searchbar" role="search" @submit.prevent="onSubmit">
    <label class="search-input" aria-hidden>
      <svg
        class="icon"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11 19a8 8 0 1 1 5.293-14.293A8 8 0 0 1 11 19z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M21 21l-4.35-4.35"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <input type="search" name="q" placeholder="Wyszukaj..." aria-label="Szukaj" />
    </label>
    <button class="submit-btn" type="submit">Szukaj</button>
  </form>
</template>

<script>
function onSubmit(event) {
  // default behaviour: submit form to current action — keep native behavior
  // but prevent full reload in SPA; use a simple navigation or custom handler later
  const form = event.target.closest('form')
  const q = form.querySelector('input[name=q]')?.value || ''
  const params = new URLSearchParams({ q })
  // fallback: navigate to /search?q=...
  window.location.href = `/search?${params.toString()}`
}
</script>

<style scoped>
.searchbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 999px;
  border: 1px solid rgba(79, 117, 199, 0.18);
  box-shadow: 0 18px 42px rgba(79, 117, 199, 0.08);
}

.search-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  flex: 1 1 auto;
}

.search-input .icon {
  color: var(--accent-strong);
}

.search-input input {
  border: none;
  outline: none;
  font-size: 0.95rem;
  padding: 6px 0;
  width: 100%;
  background: transparent;
}

.submit-btn {
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #ffffff;
  border: none;
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(79, 117, 199, 0.18);
}

.submit-btn:hover {
  box-shadow: 0 16px 36px rgba(79, 117, 199, 0.22);
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .searchbar {
    padding: 8px 10px;
  }

  .submit-btn {
    padding: 10px 14px;
  }
}
</style>
