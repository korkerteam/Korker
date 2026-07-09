import MenuPage from '@/views/MenuPage.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MenuPage
    },
    {
      path: '/test',
      name: 'test',
      component: About
    }
  ]
})

export default router