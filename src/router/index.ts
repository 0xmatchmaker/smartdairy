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
    }
  ]
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  console.log('Route change:', { from: from.path, to: to.path }) // 添加日志
  next()
})

export default router