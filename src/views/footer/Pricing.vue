<script setup></script>

<template>
  <main class="min-h-screen bg-slate-100 py-12">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <section
        class="overflow-hidden rounded-[40px] bg-white p-8 shadow-[0_35px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 sm:p-12"
      >
        <div class="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <span
              class="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-sky-700"
              >Prosty cennik</span
            >
            <h1 class="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Korzystanie z platformy Korker dla uczniów jest całkowicie bezpłatne.
            </h1>
            <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Uczniowie korzystają za darmo z wyszukiwarki, czatu i kalendarza. Korepetytorzy
              decydują o swoich stawkach i wyborze modelu rozliczeń.
            </p>
            <div class="mt-8 grid gap-4 sm:grid-cols-2">
              <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p class="text-sm font-semibold text-slate-950">Uczniowie</p>
                <p class="mt-3 text-slate-600">Brak opłat za konto, wyszukiwanie i komunikację.</p>
              </div>
              <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p class="text-sm font-semibold text-slate-950">Korepetytorzy</p>
                <p class="mt-3 text-slate-600">
                  Wybierz indywidualną stawkę lub przejrzysty abonament.
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-[32px] bg-slate-50 p-8 ring-1 ring-slate-200">
            <div class="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm">
              <span
                class="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-50 text-sky-600 text-2xl"
                >💎</span
              >
              <div>
                <p class="text-sm font-semibold text-slate-950">Przejrzystość w centrum</p>
                <p class="mt-1 text-sm text-slate-600">
                  Wszystkie koszty są jasne, bez ukrytych opłat.
                </p>
              </div>
            </div>
            <div class="mt-8 grid gap-5">
              <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                  Dla uczniów
                </p>
                <h2 class="mt-3 text-2xl font-semibold text-slate-950">0 PLN</h2>
                <p class="mt-3 text-slate-600">
                  Zakładanie konta i korzystanie z platformy jest darmowe. Płacisz tylko
                  nauczycielowi za lekcje.
                </p>
              </article>
              <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                  Dla korepetytorów
                </p>
                <h2 class="mt-3 text-2xl font-semibold text-slate-950">Stawki indywidualne</h2>
                <p class="mt-3 text-slate-600">
                  Ustalasz cenę godzinową, a my wspieramy Cię prostą obsługą płatności i rezerwacji.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
