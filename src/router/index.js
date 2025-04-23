import { createRouter, createWebHistory } from 'vue-router'
import MainView from "@/views/MainView.vue";

const routes = [
  {
    path: '/',
    name: 'home',
    component: MainView
  },
  {
    path: '/managerView',
    name: 'ManagerControllerView',
    component: () => import('@/views/ManagerControllerView.vue'),
    children: [{
      path: 'updatePassword',
      name: 'UpdatePassword',
      component: () => import('@/components/manager/UpdatePassword.vue')
    },
      {
        path: 'updatePermissionCode',
        name: 'UpdatePermissionCode',
        component: () => import('@/components/manager/UpdatePermissionCode.vue')
      },{
        path: 'goodsAndCategoriesTree',
        name: 'GoodsAndCategoriesTree',
        component: () => import('@/components/goods/GoodsAndCategoriesTree.vue')
      },{
        path: 'managerUser',
        name: 'ManagerUser',
        component: () => import("@/components/user/ManagerUser.vue"),
      },

    ],
  }
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  // }
]

// const router = createRouter({
//   history: createWebHistory(process.env.BASE_URL),
//   routes
// })

const router = createRouter({
  history: createWebHistory('/manager'), // 添加"/manager"前缀
  routes
})

export default router
