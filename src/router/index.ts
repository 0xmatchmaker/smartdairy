import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/diary'
    },
    {
      path: '/diary',
      component: () => import('../views/DiaryView.vue')
    },
    {
      path: '/history',
      component: () => import('../views/HistoryView.vue')
    }
  ]
})

export default router