//导入Axios
import axios from "axios"


// 创建Axios对象-request，用于发送请求到后端
const request = axios.create({
    // 设置超时时间
    timeout:5000
})




//request拦截器的处理
// 1.可以对请求做统一处理
// 2.比如统一的加入token.Content-Type等
request.interceptors.request.use(config => {
    // 设置请求格式，以及编码
    config.headers['Content-Type'] = 'application/json;charset=utf-8'
    // 返回数据
    return config

},error => {

    return Promise.reject(error);

})

request.interceptors.response.use(response =>{

    let result = response.data;
    // 如果返回的是文件，就直接返回
    if(response.config.responseType === 'blob'){
        return result ;
    }
    // 如果是String,就转成JSON对象
    if(typeof result === 'string'){
        // 如果Result不为NULL，就进行转换成JSON对象
        result = result ? JSON.parse(result):result

    }
    return result ;

},error => {

    console.log("error",error)

    return Promise.reject(error)

})


// 导出request
export default request;















