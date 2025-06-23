import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 引入element-plus组件库
import ElementPlus from 'element-plus'
// 引入element-plus组件库样式
import 'element-plus/dist/index.css'
// 引入中文语言包，也就是所谓的国际化
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// 注册全局组件
import http from './utils/request'

// 初始化认证状态
store.dispatch('initializeAuth')

const app = createApp(App)
    app.use(store);
    app.use(router);
    // 使用element-plus组件库
    app.use(ElementPlus,{ locale: zhCn });
    // 将 Axios 实例挂载到全局
    app.config.globalProperties.$http = http;
    app.mount('#app');
