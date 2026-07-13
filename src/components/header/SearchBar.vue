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
  background: linear-gradient(180deg, #ffffff, #fbfdff);
  padding: 6px;
  border-radius: 999px;
  box-shadow: 0 6px 20px rgba(31, 65, 137, 0.08);
  border: 1px solid rgba(79, 117, 199, 0.12);
}

.search-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: transparent;
  border-radius: 999px;
  flex: 1 1 auto;
}

.search-input .icon {
  color: var(--primary-color);
  opacity: 0.95;
}

.search-input input {
  border: none;
  outline: none;
  font-size: 14px;
  padding: 6px 0;
  width: 100%;
  background: transparent;
}

.submit-btn {
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(79, 117, 199, 0.18);
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    opacity 120ms ease;
}

.submit-btn:hover {
  background-color: var(--primary-color-hover);
  box-shadow: 0 14px 36px rgba(79, 117, 199, 0.22);
}

@media (max-width: 900px) {
  .searchbar {
    padding: 4px;
  }
  .submit-btn {
    padding: 8px 12px;
  }
}
</style>
