import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
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