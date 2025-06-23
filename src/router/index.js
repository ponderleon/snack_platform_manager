import {createRouter, createWebHistory} from 'vue-router'
import MainView from "@/views/MainView.vue";
import store from "@/store";

const routes = [
    {
        path: '/',
        name: 'home',
        component: MainView
    },
    {
        path: '/managerView',
        name: 'ManagerControllerView',
        meta: {requiresAuth: true}, //设置需要认证
        component: () => import('@/views/ManagerControllerView.vue'),
        children: [{
            path: 'updatePassword',
            name: 'UpdatePassword',
            meta: {requiresAuth: true}, //设置需要认证
            component: () => import('@/components/manager/UpdatePassword.vue')
        },
            {
                path: 'updatePermissionCode',
                name: 'UpdatePermissionCode',
                meta: {requiresAuth: true}, //设置需要认证
                component: () => import('@/components/manager/UpdatePermissionCode.vue')
            },
            {
                path: 'managerUser',
                name: 'ManagerUser',
                meta: {requiresAuth: true}, //设置需要认证
                component: () => import("@/components/user/ManagerUser.vue"),
            }, {
                path: 'managerMerchant',
                name: 'ManagerMerchant',
                meta: {requiresAuth: true}, //设置需要认证
                component: () => import('@/components/merchant/ManagerMerchant.vue')
            }, {
                path: 'attributeGroup',
                name: 'AttributeGroup',
                meta: {requiresAuth: true}, //设置需要认证
                component: () => import('@/components/goods/attribute/AttributeGroup.vue')
            }, {
                path: 'attribute',
                name: 'Attribute',
                meta: {requiresAuth: true}, //设置需要认证
                component: () => import('@/components/goods/attribute/Attribute.vue')
            },
            {
                path: 'brand',
                name: 'Brand',
                meta: {requiresAuth: true}, //设置需要认证
                component: () => import('@/components/goods/brand/Brand.vue')
            },
            {
                path: 'categoryManager',
                name: 'CategoryManager',
                meta: {requiresAuth: true}, //设置需要认证
                component: () => import('@/components/goods/category/CategoryManager.vue')
            },
            {
                path: 'categoryTree',
                name: 'CategoryTree',
                meta: {requiresAuth: true}, //设置需要认证
                component: () => import('@/components/goods/category/CategoryTree.vue')
            },{
                path: 'skuInfo',
                name: 'SkuInfo',
                meta: {requiresAuth: true}, //设置需要认证
                component: () => import('@/components/goods/sku/SkuInfo.vue')
            },{
                path: 'spuInfo',
                name: 'SpuInfo',
                meta: {requiresAuth: true}, //设置需要认证
                component: () => import('@/components/goods/spu/SpuInfo.vue')
            },{
                path: 'goodsEnter',
                name: 'GoodsEnterView',
                meta: {requiresAuth: true}, //设置需要认证
                component: () => import('@/components/goods/GoodsEnter.vue')
            },{
                path: 'order',
                name: 'Order',
                component: () => import('@/components/order/Order.vue')
            }
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

/**
 * 添加全局前置守卫
 */
router.beforeEach((to, from, next) => {

    // 检查目标路由是否需要检查
    if (to.matched.some(record => record.meta.requiresAuth)) {

        console.log("====================================")

        // 检查用户是否登录
        if (!store.getters.getIsLogin) {

            next({
                path: '/',
                // 将目标路由的完整路径添加到查询参数中，便于登录后重定向
                query: {redirect: to.fullPath}
            })

        } else {
            // 放行
            next();
        }

    } else {
        // 无需认证直接放行
        next();
    }

})
export default router
