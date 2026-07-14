import MenuPage from '@/views/MenuPage.vue'
import HowItWorks from '@/views/HowItWorks.vue'
import CalendarInfo from '@/views/CalendarInfo.vue'
import Pricing from '@/views/Pricing.vue'
import BecomeTutor from '@/views/BecomeTutor.vue'
import TutorBenefits from '@/views/TutorBenefits.vue'
import JoinDatabase from '@/views/JoinDatabase.vue'
import TutorFAQ from '@/views/TutorFAQ.vue'
import HelpCenter from '@/views/HelpCenter.vue'
import Contact from '@/views/Contact.vue'
import Terms from '@/views/Terms.vue'
import Privacy from '@/views/Privacy.vue'
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
      path: '/cennik',
      name: 'cennik',
      component: Pricing,
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
