<script setup></script>

<template>
  <main class="min-h-screen bg-slate-100 py-12">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <section
        class="overflow-hidden rounded-[40px] bg-white p-8 shadow-[0_35px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 sm:p-12"
      >
        <div class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <span
              class="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-sky-700"
              >Zintegrowany kalendarz</span
            >
            <h1 class="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Zarządzaj swoimi lekcjami w jednym, wygodnym miejscu.
            </h1>
            <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Kalendarz Korker daje pełną widoczność Twoich zajęć, automatyczne przypomnienia i
              wygodny sposób na zmiany terminów.
            </p>
            <div class="mt-8 grid gap-4 sm:grid-cols-2">
              <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p class="text-sm font-semibold text-slate-950">Dostępność online</p>
                <p class="mt-3 text-slate-600">
                  Ustaw godziny, kiedy chcesz pracować i od razu pokaż je uczniom.
                </p>
              </div>
              <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p class="text-sm font-semibold text-slate-950">Automatyczne przypomnienia</p>
                <p class="mt-3 text-slate-600">
                  Powiadomienia informują o nadchodzących lekcjach, żebyś niczego nie przegapił.
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-[32px] bg-slate-50 p-6 ring-1 ring-slate-200">
            <div class="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm">
              <span
                class="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-50 text-sky-600 text-2xl"
                >📅</span
              >
              <div>
                <p class="text-sm font-semibold text-slate-950">Wszystko w jednym miejscu</p>
                <p class="mt-1 text-sm text-slate-600">
                  Sprawdź swoje terminy i ustaw preferencje w wygodnym widoku.
                </p>
              </div>
            </div>
            <div class="mt-6 grid gap-4">
              <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div class="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                  Feature 1
                </div>
                <h2 class="mt-3 text-xl font-semibold text-slate-950">Podgląd na żywo</h2>
                <p class="mt-3 text-slate-600">
                  Uczniowie widzą wolne terminy korepetytora w czasie rzeczywistym.
                </p>
              </article>
              <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div class="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                  Feature 2
                </div>
                <h2 class="mt-3 text-xl font-semibold text-slate-950">
                  Lekcje online i stacjonarne
                </h2>
                <p class="mt-3 text-slate-600">
                  Wybieraj formę zajęć, a system automatycznie obsłuży linki i rezerwacje.
                </p>
              </article>
              <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div class="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                  Feature 3
                </div>
                <h2 class="mt-3 text-xl font-semibold text-slate-950">Powiadomienia</h2>
                <p class="mt-3 text-slate-600">
                  Otrzymasz przypomnienia o nadchodzących lekcjach i zmianach w harmonogramie.
                </p>
              </article>
              <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div class="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                  Feature 4
                </div>
                <h2 class="mt-3 text-xl font-semibold text-slate-950">Łatwa zmiana terminów</h2>
                <p class="mt-3 text-slate-600">
                  Zmieniaj lub odwołuj lekcje jednym kliknięciem, zgodnie z dostępnymi godzinami.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
