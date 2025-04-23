const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
module.exports = {
  //设置项目启动时使用的端口号
  devServer:{
    port:8080,
    proxy:{//设置代理，必须填
      '/data':{ //设置拦截器，拦截器格式: /+拦截器名字，名字可以自己定
        target:"http://localhost:9090",//代理的目标地址，就是/data代替http://localhost:9090
        changeOrigin:true, //是否设置同源，输入true或false
        secure: false, // 如果目标服务器使用 HTTPS，设置为 false
        pathRewrite:{  //路径重写
          '^/data':'' // 路径重写，将 /data 替换为空字符串
        }
      }
    }
  }
}