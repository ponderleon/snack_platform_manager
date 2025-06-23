import { createStore } from 'vuex'

export default createStore({
  state: {
    manager:{
      id: '', // 管理员id
      username: '', // 管理员账号
      isLogin: false // 是否登录标志
    }
  },
  getters: {
    /**
     * 获取是否登录
     * @param state
     * @returns {boolean}
     */
    getIsLogin(state){
      return state.manager.isLogin
    },
    /**
     *  获取管理员登录数据
     * @param state
     * @returns {{id: string, username: string, isLogin: boolean}}
     */
    getManager(state){
      return state.manager
    }
  },
  mutations: {
    /**
     * 设置state中的manager的数据
     * @param state
     * @param manager
     */
    setManager(state,manager){
      state.manager.id = manager.id
      state.manager.username = manager.username
      state.manager.isLogin = true
    },
    /**
     * 重置state中的manager
     * @param state
     */
    clearManager(state){
      state.manager.id = ''
      state.manager.username = ''
      state.manager.isLogin = false
    }
  },
  actions: {
    /**
     * 登录操作
     * @param commit
     * @param manager
     */
    login({commit},manager){
      // 将数据进行本地存储，以便页面刷新后保持登录状态
      sessionStorage.setItem('manager',JSON.stringify(manager))
      // 提交数据跟新state中的merchant
      commit('setManager',manager)

    },
    /**
     * 退出登录
     * @param commit
     */
    loginOut({commit}){
      // 清除本地数据
      sessionStorage.removeItem('manager')
      // 提交清除方法
      commit('clearManager')
    },
    /**
     * 验证是否登录操作
     * @param commit
     */
    initializeAuth({commit}){
      //  获取登录数据
      const manager =  sessionStorage.getItem('manager')
      //  判断是否有数据
      if(manager){
        // 如果存在商家数据则恢复状态
        commit('setManager',JSON.parse(manager))
      }

    }
  },
  modules: {
  }
})
