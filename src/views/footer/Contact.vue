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
  <main class="min-h-screen bg-slate-50 py-10">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <section
        class="overflow-hidden rounded-[32px] bg-white p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 sm:p-10"
      >
        <div class="sm:flex sm:items-start sm:justify-between sm:gap-8">
          <div class="max-w-2xl">
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">
              Skontaktuj się z nami
            </p>
            <h1 class="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Masz pytania, uwagi lub potrzebujesz pomocy technicznej? Napisz do nas!
            </h1>
            <p class="mt-4 text-base leading-7 text-slate-600">
              Nasz zespół wsparcia jest gotowy, by pomóc w kwestiach związanych z kontem, czatem,
              lekcjami i płatnościami.
            </p>
          </div>
          <div
            class="mt-6 inline-flex items-center gap-3 rounded-3xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 sm:mt-0"
          >
            <span
              class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600"
              >📬</span
            >
            Odpowiadamy szybko i sprawnie.
          </div>
        </div>

        <div class="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <form
            class="rounded-[28px] border border-slate-200 bg-slate-50 p-8 shadow-sm"
            @submit.prevent="handleSubmit"
          >
            <div class="grid gap-6 sm:grid-cols-2">
              <label class="space-y-2 text-sm font-medium text-slate-800">
                Imię i nazwisko
                <input
                  v-model="form.name"
                  type="text"
                  class="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  placeholder="Jan Kowalski"
                />
              </label>
              <label class="space-y-2 text-sm font-medium text-slate-800">
                Adres E-mail
                <input
                  v-model="form.email"
                  type="email"
                  class="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  placeholder="kontakt@domena.pl"
                />
              </label>
            </div>

            <label class="mt-6 space-y-2 text-sm font-medium text-slate-800">
              Temat wiadomości
              <input
                v-model="form.subject"
                type="text"
                class="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                placeholder="Np. problem z czatem"
              />
            </label>

            <label class="mt-6 space-y-2 text-sm font-medium text-slate-800">
              Treść wiadomości
              <textarea
                v-model="form.message"
                rows="6"
                class="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                placeholder="Opisz swoją sprawę..."
              ></textarea>
            </label>

            <button
              type="submit"
              class="mt-3 inline-flex items-center justify-center rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Wyślij wiadomość
            </button>
          </form>

          <aside class="space-y-6 rounded-[28px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div
              class="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-50 text-sky-600"
            >
              📬
            </div>
            <div>
              <h2 class="text-xl font-semibold text-slate-950">Dane kontaktowe</h2>
              <p class="mt-3 text-slate-600">E-mail:</p>
              <p class="mt-1 text-slate-900">kontakt@korker.pl</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Godziny pracy wsparcia
              </h3>
              <p class="mt-3 text-slate-900">Pon - Pt: 9:00 - 17:00</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  </main>
</template>
