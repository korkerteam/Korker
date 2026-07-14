<script setup></script>

<template>
  <main class="min-h-screen bg-slate-50 py-10">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <section
        class="overflow-hidden rounded-[32px] bg-white p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 sm:p-10"
      >
        <div class="sm:flex sm:items-start sm:justify-between sm:gap-8">
          <div class="max-w-2xl">
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">
              Centrum Pomocy Korker
            </p>
            <h1 class="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Masz pytania? Znajdziesz tu wszystkie odpowiedzi.
            </h1>
            <p class="mt-4 text-base leading-7 text-slate-600">
              Szybko znajdź pomoc, poradniki i odpowiedzi w jednym, przejrzystym miejscu.
            </p>
          </div>
          <div
            class="mt-6 inline-flex items-center gap-3 rounded-3xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 sm:mt-0"
          >
            <span
              class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600"
              >🛠️</span
            >
            Pomoc dla uczniów i korepetytorów.
          </div>
        </div>

        <div class="mt-10 space-y-8">
          <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div class="relative">
              <input
                type="search"
                placeholder="Szukaj tematu pomocy..."
                class="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 pr-14 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100"
              />
              <span
                class="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
                >🔎</span
              >
            </div>
          </div>

          <div class="grid gap-6 lg:grid-cols-3">
            <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div
                class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600"
              >
                🎓
              </div>
              <h2 class="mt-5 text-lg font-semibold text-slate-950">Dla Uczniów</h2>
              <p class="mt-3 text-slate-600">
                Jak rezerwować lekcje, płatności i odwoływanie zajęć.
              </p>
            </article>

            <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div
                class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600"
              >
                👩‍🏫
              </div>
              <h2 class="mt-5 text-lg font-semibold text-slate-950">Dla Korepetytorów</h2>
              <p class="mt-3 text-slate-600">Zarządzanie kalendarzem, cennik, profil i opinie.</p>
            </article>

            <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div
                class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600"
              >
                🖥️
              </div>
              <h2 class="mt-5 text-lg font-semibold text-slate-950">Kwestie Techniczne</h2>
              <p class="mt-3 text-slate-600">Konto, czat, powiadomienia i lekcje online.</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
