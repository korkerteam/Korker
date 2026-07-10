import MenuPage from '@/views/MenuPage.vue'
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
      path: '/szukaj',
      name: 'search',
      component: MenuPage,
    },
  ],
})

export default router
