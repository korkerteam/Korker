import MenuPage from '@/views/MenuPage.vue'
import FindKorks from '@/views/FindKorks.vue'
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
      path: '/korker-szukaj',
      name: 'korker-szukaj',
      component: FindKorks,
    },
    {
      path: '/szukaj',
      redirect: { name: 'korker-szukaj' },
    },
  ],
})

export default router
