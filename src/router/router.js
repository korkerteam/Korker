import MenuPage from '@/views/footer/MenuPage.vue'
import HowItWorks from '@/views/footer/HowItWorks.vue'
import CalendarInfo from '@/views/footer/CalendarInfo.vue'
import BecomeTutor from '@/views/footer/BecomeTutor.vue'
import TutorBenefits from '@/views/footer/TutorBenefits.vue'
import JoinDatabase from '@/views/footer/JoinDatabase.vue'
import TutorFAQ from '@/views/footer/TutorFAQ.vue'
import HelpCenter from '@/views/footer/HelpCenter.vue'
import Contact from '@/views/footer/Contact.vue'
import Terms from '@/views/footer/Terms.vue'
import Privacy from '@/views/footer/Privacy.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MenuPage,
    },
    {
      path: '/profil',
      name: 'profil',
      component: MenuPage,
    },
    {
      path: '/nauczyciele',
      name: 'nauczyciele',
      component: MenuPage,
    },
    {
      path: '/korker-szukaj',
      redirect: { name: 'home', query: { search: '1' } },
    },
    {
      path: '/jak-to-dziala',
      name: 'jak-to-dziala',
      component: HowItWorks,
    },
    {
      path: '/kalendarz',
      name: 'kalendarz',
      component: CalendarInfo,
    },
    {
      path: '/zostan-korepetytorem',
      name: 'zostan-korepetytorem',
      component: BecomeTutor,
    },
    {
      path: '/korzysci-dla-korepetytorow',
      name: 'korzysci-dla-korepetytorow',
      component: TutorBenefits,
    },
    {
      path: '/dolacz-do-bazy',
      name: 'dolacz-do-bazy',
      component: JoinDatabase,
    },
    {
      path: '/faq-korepetytorzy',
      name: 'faq-korepetytorzy',
      component: TutorFAQ,
    },
    {
      path: '/centrum-pomocy',
      name: 'centrum-pomocy',
      component: HelpCenter,
    },
    {
      path: '/kontakt',
      name: 'kontakt',
      component: Contact,
    },
    {
      path: '/regulamin',
      name: 'regulamin',
      component: Terms,
    },
    {
      path: '/polityka-prywatnosci',
      name: 'polityka-prywatnosci',
      component: Privacy,
    },
    {
      path: '/szukaj',
      redirect: { name: 'home', query: { search: '1' } },
    },
  ],
})

export default router
