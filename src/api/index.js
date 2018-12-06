import axios from "axios"

export function WechatHandler() {
  const url = process.env.NODE_ENV == "production" ? "https://www.ipow.cn/Data_Interface/WeiXin.aspx" : "/api/wxAppUrl"
  const data = {
    url: window.location.href
  }

  return axios.post(url, data).then((res) => {
    return Promise.resolve(res.data)
  })
}

