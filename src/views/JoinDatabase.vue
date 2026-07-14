<script setup></script>

<template>
  <main class="min-h-screen bg-slate-100 py-12">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <section
        class="overflow-hidden rounded-[40px] bg-white p-8 shadow-[0_35px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 sm:p-12"
      >
        <div class="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
          <div>
            <span
              class="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-sky-700"
              >Dołącz do bazy</span
            >
            <h1 class="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Zwiększ swoją widoczność i daj się znaleźć uczniom z całej Polski.
            </h1>
            <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Nasza wyszukiwarka codziennie łączy setki uczniów z odpowiednimi korepetytorami.
              Dołączając do bazy, zyskujesz stały dopływ nowych zleceń.
            </p>
            <div class="mt-8 grid gap-4">
              <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p class="text-sm font-semibold text-slate-950">Precyzyjne dopasowanie</p>
                <p class="mt-3 text-slate-600">
                  Uczniowie znajdują Cię przez filtry po przedmiocie, poziomie, cenie i ocenie.
                </p>
              </div>
              <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p class="text-sm font-semibold text-slate-950">Stały ruch</p>
                <p class="mt-3 text-slate-600">
                  Zwiększaj liczbę zapytań i rezerwacji dzięki codziennym wyświetleniom.
                </p>
              </div>
            </div>
          </div>
          <div class="rounded-[32px] bg-slate-50 p-8 ring-1 ring-slate-200">
            <div class="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm">
              <span
                class="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-50 text-sky-600 text-2xl"
                >📈</span
              >
              <div>
                <p class="text-sm font-semibold text-slate-950">Skoncentruj się na wzroście</p>
                <p class="mt-1 text-sm text-slate-600">
                  Pomagamy Ci zdobywać kolejne zlecenia bez dodatkowej pracy marketingowej.
                </p>
              </div>
            </div>
            <div class="mt-8 space-y-5">
              <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-xl font-semibold text-slate-950">Stały dopływ uczniów</h2>
                <p class="mt-3 text-slate-600">
                  Nasza baza pomaga Ci być widocznym dla uczniów z różnych regionów.
                </p>
              </article>
              <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-xl font-semibold text-slate-950">Lepsze filtrowanie</h2>
                <p class="mt-3 text-slate-600">
                  Twoje ogłoszenie trafia do osób, które najlepiej pasują do Twojego profilu.
                </p>
              </article>
              <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-xl font-semibold text-slate-950">Szybki start</h2>
                <p class="mt-3 text-slate-600">
                  Zarejestruj profil i zacznij przyjmować zapytania już dziś.
                </p>
              </article>
            </div>
            <router-link
              to="/zostan-korepetytorem"
              class="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >Stwórz profil korepetytora teraz</router-link
            >
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
