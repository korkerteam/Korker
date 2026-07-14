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
  <main class="min-h-screen bg-slate-50 py-10">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <section
        class="overflow-hidden rounded-[32px] bg-white p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 sm:p-10"
      >
        <div class="sm:flex sm:items-start sm:justify-between sm:gap-8">
          <div class="max-w-2xl">
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">
              FAQ dla korepetytorów
            </p>
            <h1 class="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Najczęściej zadawane pytania przez nauczycieli
            </h1>
            <p class="mt-4 text-base leading-7 text-slate-600">
              Znajdź szybkie odpowiedzi na pytania o rejestrację, rozliczenia i obsługę kalendarza
              Korker.
            </p>
          </div>
          <div
            class="mt-6 inline-flex items-center gap-3 rounded-3xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 sm:mt-0"
          >
            <span
              class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600"
              >❓</span
            >
            Info w przejrzystej formie.
          </div>
        </div>

        <div class="mt-10 space-y-4">
          <article
            v-for="(faq, index) in faqs"
            :key="faq.question"
            class="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-sm"
          >
            <button
              type="button"
              @click="toggleFAQ(index)"
              class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span class="text-lg font-semibold text-slate-950">{{ faq.question }}</span>
              <span
                class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm"
              >
                <span v-if="faq.open">−</span>
                <span v-else>+</span>
              </span>
            </button>
            <div
              v-if="faq.open"
              class="border-t border-slate-200 bg-white px-6 py-5 text-slate-600"
            >
              {{ faq.answer }}
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>
