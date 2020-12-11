/*
 * @Author: LiTianfu
 * @Date: 2020-11-30 14:08:18
 * @LastEditTime: 2020-11-30 14:29:16
 * @LastEditors: LiTianfu
 * @Description: request tools
 * @FilePath:
 */

const token = {}
const waitList = []
let wechatLogin = false

// ************ 发券插件专用 start ************

// const sendCouponBaseUrl = 'https://hwj-apicb-test-k8s.vchangyi.com/'
const sendCouponBaseUrl = 'https://api-prod.haowuji123.com/'

const doRequest = req => {
  if (!token.token) {
    waitList.push(req)
    goRequest()
  } else {
    makeRequestSendCoupon(req)
  }
}

const goRequest = () => {
  // 登录
  if (!wechatLogin) {
    wechatLogin = true
    wx.login({
      success(res) {
        // 先清空历史队列
        const v = waitList.shift()
        if (v) {
          makeRequestSendCoupon(v, res.code)
        }
      },
      fail(res) {
        setTimeout(goRequest, 100)
      },
      complete() {
        wechatLogin = false
      }
    })
  }
}
// 1
const makeRequestSendCoupon = (req, wxcode) => {
  const header = {
    'content-type': 'application/json',
  }
  if (wxcode) {
    header['X-Wechat-Code'] = wxcode
  } else if (token.token instanceof Array) {
    header['X-Adserver-Token'] = token.token[0]
  } else {
    header['X-Adserver-Token'] = token.token
  }
  wx.request({
    url: sendCouponBaseUrl + req.path,
    data: req.data,
    header,
    method: req.method,
    success: req.success,
    fail: req.fail,
    complete(res) {
      if (res.header && res.header['X-Adserver-Token']) {
        token.token = res.header['X-Adserver-Token']
        token.ts = new Date().getTime()
        wx.setStorageSync('send_coupon_token', token)
        const v = waitList.shift()
        if (v) {
          doRequest(v)
        }
      }
    }
  })
}

// 2
const makeRequestWithLoginSendCoupon = req => {
  wx.login({
    success(res) {
      makeRequestSendCoupon(req, res.code)
    },
    fail(res) {
      setTimeout(makeRequestWithLoginSendCoupon, 100)
    },
    complete() {
    }
  })
}

const doRequestCheckSessionSendCoupon = req => {
  if (token.token) {
    wx.checkSession({
      success(res) {
        makeRequestSendCoupon(req)
      },
      fail(err) {
        makeRequestWithLoginSendCoupon(req)
      }
    })
  } else {
    makeRequestWithLoginSendCoupon(req)
  }
}

// ************ 发券插件专用 end **************

module.exports = {
  doRequestCheckSessionSendCoupon,
}
