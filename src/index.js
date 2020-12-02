import api from '../tools/demo/utils/request'

const _ = require('./utils')

let _this = null

Component({
  properties: {
    token: { // 发券所需token (request-header)
      type: String,
      value: 'BhGDQJ368Ft8iShb6usAH4Xli8w4BerE'
    },
    openid: { // 用户open_id (YOUR_OPEN_ID)
      type: String,
      value: 'oiSTd4kj_txKQ8Mio5yUB_JY1EgI'
    },
    stock_max: { // 券数量
      type: Number,
      value: 0
    },
    loc_name: { // 流量位标识
      type: String,
      value: 'fb_ad_loc'
    },
    tag_id: {
      type: String,
      value: ''
    }
  },
  data: {
    flag: false,

    stock_list: [], // 展示的商户券列表
    sendWill: [], // 待领取的商户券列表
    sign: '', // 插件所需签名
    send_coupon_merchant: '', // 发券商户号
    open_some_one: 0, // 默认打开第一张券详情
    open_detail_params: [], // 打开多张券详情时的缓存数据
    receive_success: false, // 领券成功
    sendAll: true, // 都可领
  },
  pageLifetimes: {
    show() {
      // 页面被展示
    },
    hide() {
      // 页面被隐藏
    },
    resize(size) {
      // 页面尺寸变化
    }
  },
  lifetimes: {
    // 在组件实例进入页面节点树时执行
    attached() {
      _this = this
      this.getAdvData()
      wx.getSystemInfo({
        success: () => {
          this.setData({
            flag: _.getFlag(),
          })
        }
      })
    },
    // 在组件实例被从页面节点树移除时执行
    detached() {

    },
  },
  methods: {
    // 获取优惠券信息
    getAdvData() {
      const { loc_name, token, openid, tag_id, stock_max } = this.data;
      const r = /^\+?[1-5]*$/;
      // if (!loc_name || !token || !openid || !tag_id) {
      if (!loc_name || !token || !openid) {
        global.tip.toast(`缺少必需参数`);
        return;
      }
      if (!r.test(stock_max)) {
        global.tip.toast(`传入的 stock_max 有误 !`);
        return;
      }
      global.tip.loading()
      api.doRequestCheckSessionSendCoupon({
        path: 'pay_ad/ad_busifavor',
        method: 'POST',
        data: {
          loc_name,
          token,
          openid,
          tag_id,
          stock_max
        },
        success(res) {
          console.log('获取优惠券 ', res.data)
          const couponData = res.data.stock_list
          if (couponData) {
            const sendWill = couponData.filter(g => g.send_type === 1)
            _this.setData({
              sign: res.data.sign,
              send_coupon_merchant: res.data.send_coupon_merchant,
              stock_list: couponData,
              sendWill,
              sendAll: sendWill.length === couponData.length
            }, () => {
              _this.sendCouponShow(couponData)
            })
          }
          global.tip.loaded()
          if (res.data.code === -1) {
            global.tip.toast(res.data.message)
          }
        },
        fail(res) { global.tip.loaded() }
      })
    },

    // 优惠券展示上报
    sendCouponShow(params) {
      const stock_list = [], { token, openid, loc_name } = this.data;
      params.forEach((v, i) => {
        stock_list.push({stock_id: v.stock_id})
      })
      const data =
        {
          loc_name,
          token,
          openid,
          stock_list,
        }
      api.doRequestCheckSessionSendCoupon({
        path: 'pay_ad/ad_show_notice',
        method: 'POST',
        data,
        success: res => console.log('优惠券展示通知', res),
        fail: err => console.error('优惠券展示上报失败', err)
      })
    },

    // 领券插件
    _getcoupon(params) {
      console.log('领券插件', params)
      if (params.detail.errcode === 'OK') {
        const data = params.detail.send_coupon_result; const
          {sendAll, stock_list} = this.data
        // 领券结果上报
        // this.sendCouponResult(data);

        const results = data.filter(g => g.code === 'SUCCESS')
        if (results.length) {
          if (!sendAll) {
            stock_list.forEach((v, i) => {
              const sd = results.find(g => g.stock_id === v.stock_id)
              if (sd) v.coupon_code = sd.coupon_code
            })
          }
          this.setData({open_detail_params: stock_list}, () => {
            this.openCouponDetail()
          })
        } else {
          global.tip.toast(data[0].message)
        }
      } else {
        global.tip.toast(params.detail.msg)
      }
    },

    /**
     * 领券结果上报
     */
    sendCouponResult(params) {
      const stock_list = []; const
        {loc_name, token, openid} = this.data
      params.forEach((v, i) => {
        stock_list.push({
          stock_id: v.stock_id,
          out_request_no: v.out_request_no,
          wechat_code: v.code,
          coupon_id: v.coupon_code
        })
      })
      const data =
        {
          loc_name,
          token,
          openid,
          stock_list
        }
      api.doRequestCheckSessionSendCoupon({
        path: 'pay_ad/ad_im',
        method: 'POST',
        data,
        success: res => console.log('领券结果上报通知', res),
        fail: err => console.error('上报失败', err)
      })
    },

    /**
     * 打开券详情
     */
    openCouponDetail() {
      const
        stock_list = []
      const {
        loc_name,
        token,
        openid,
        open_some_one,
        open_detail_params
      } = this.data

      stock_list.push({
        stock_id: open_detail_params[open_some_one].stock_id,
        coupon_code: open_detail_params[open_some_one].coupon_code
      })

      api.doRequestCheckSessionSendCoupon({
        path: 'pay_ad/ad_open_card',
        method: 'POST',
        data: {
          loc_name,
          token,
          openid,
          stock_list
        },
        success: res => {
          console.log('打开券列表', res.data)
          res.data.card_list.forEach((v, i) => {
            v.cardId = v.card_id
            v.openCardParams = v.open_params

            delete v.card_id
            delete v.open_params
          })
          _this.setData({receive_success: true})
          wx.openCard({
            cardList: res.data.card_list,
            complete: res => {
              console.log('openCard => ', res)
            }
          })
        },
        fail: err => {}
      })
    },

    /**
     * 点击某一张券
     */
    moreCouponDetail(e) {
      const open_some_one = Number(e.detail); const
        {receive_success} = this.data
      if (!receive_success) return // 券未领取 将触发领券机制
      this.setData({open_some_one}, () => this.openCouponDetail())
    },
  }
})
