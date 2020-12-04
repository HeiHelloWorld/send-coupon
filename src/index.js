import api from './tools/request';
import Tool from './utils';
const TIP = require("./tools/tip").default;
let _this = null;

Component({
  options: {
    styleIsolation: 'isolated'
  },
  properties: {
    token: { // 发券所需token (request-header)
      type: String,
      value: ''
    },
    openid: { // 用户open_id (YOUR_OPEN_ID)
      type: String,
      value: ''
    },
    stock_max: { // 券数量
      type: Number,
      value: 0
    },
    loc_name: { // 流量位标识
      type: String,
      value: ''
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
      _this = this;
      this.setData({ flag: Tool.getFlag() })
      console.log('Tool', Tool.timestampToDay('1607510346'));
    },
    // 在组件实例被从页面节点树移除时执行
    detached() {

    },
  },
  observers: {
    'stock_max': function (val) {
      console.log('数据监听', val)
      if (val !== 0) {
        Promise.all([this.getCouponSty(), this.getAdvData()]).then(([value1, value2]) => {
          const sendWill = value2.stock_list.filter(v => v.send_type === 1);

          const stock_list = value2.stock_list.reduce((pre, cur) => {
            const couponObj = value1.stock_mat.find(v => v.stock_id === cur.stock_id);
            Object.assign(cur, couponObj);
            cur.start_time = Tool.timestampToDay(cur.available_begin_time)
            cur.end_time = Tool.timestampToDay(cur.available_end_time)
            pre.push(cur)
            return pre;
          }, []);

          console.log('stock_list', stock_list);
          _this.setData({
            stock_list,
            sign: value2.sign,
            send_coupon_merchant: value2.send_coupon_merchant,
            sendWill
          }, () => _this.sendCouponShow(value2.stock_list));
        })
      }
    }
  },
  methods: {
    /**
     * 获取优惠券素材
     */
    getCouponSty() {
      const { token, loc_name } = this.data;
      return new Promise((resolve, reject) => {
        api.doRequestCheckSessionSendCoupon({
          path: 'pay_ad/ad_material',
          method: 'POST',
          data: {
            loc_name,
            token
          },
          success(res) {
            if (res.data.stock_mat) {
              resolve(res.data)
            } else {
              TIP.toast(res.data.message || '获取优惠券素材失败 !')
              reject(res.data)
            }
          },
          fail(err) { reject(err) }
        })
      })
    },
    /**
     * 获取优惠券批次信息
     * @param {*} params 
     */
    getAdvData() {
      const { loc_name, token, openid, tag_id, stock_max } = this.data, r = /^\+?[1-5]*$/;
      const kong = [
        { key: 'loc_name', value: loc_name },
        { key: 'token', value: token },
        { key: 'openid', value: openid },
        // { key: 'tag_id', value: tag_id }
      ].filter(v => !v.value)[0];
      if (kong) {
        TIP.toast(`缺少必需参数: ${kong.key}`);
        return;
      }
      if (!r.test(stock_max)) {
        TIP.toast(`传入的 stock_max 有误 !`);
        return;
      }
      const data = { loc_name, token, openid, tag_id, stock_max };
      TIP.loading()
      return new Promise((resolve, reject) => {
        api.doRequestCheckSessionSendCoupon({
          path: 'pay_ad/ad_busifavor',
          method: 'POST',
          data,
          success(res) {
            const couponData = res.data.stock_list
            if (couponData) {
              resolve(res.data)
            } else {
              TIP.toast(res.data.message || '获取优惠券信息失败 !')
              reject(res.data)
            }
            TIP.loaded()
          },
          fail(err) {
            TIP.loaded();
            reject(err)
          }
        })
      })
    },

    /**
     * 优惠券展示上报
     * @param {*} params 
     */
    sendCouponShow(params) {
      const stock_list = [], { token, openid, loc_name } = this.data;
      params.forEach((v, i) => {
        stock_list.push({stock_id: v.stock_id})
      })
      const data = { loc_name, token, openid, stock_list };
      api.doRequestCheckSessionSendCoupon({
        path: 'pay_ad/ad_show_notice',
        method: 'POST',
        data,
        success: res => console.log('优惠券展示通知', res),
        fail: err => console.error('优惠券展示上报失败', err)
      })
    },

    /**
     * 领券插件
     * @param {*} params 
     */
    _getcoupon(params) {
      console.log('领券插件', params)
      if (params.detail.errcode === 'OK') {
        const data = params.detail.send_coupon_result, { stock_list } = this.data;
        // 领券结果上报
        // this.sendCouponResult(data);

        const results = data.filter(g => g.code === 'SUCCESS')
        if (results.length > 0) {
          const open_detail_params = stock_list.reduce((pre, cur) => {
            const sd = results.find(g => g.stock_id === cur.stock_id);
            if (sd) cur.coupon_code = sd.coupon_code;
            pre.push(cur);
            return pre;
          }, []);
          this.setData({
            open_detail_params,
            receive_success: true
          }, () => {
            this.openCouponDetail()
          })
        } else {
          TIP.toast(data[0].message)
        }
      } else {
        TIP.toast(params.detail.msg)
      }
    },

    /**
     * 领券结果上报
     * @param {*} params 
     */
    sendCouponResult(params) {
      const stock_list = [], { loc_name, token, openid } = this.data;
      params.forEach((v, i) => {
        stock_list.push({
          stock_id: v.stock_id,
          out_request_no: v.out_request_no,
          wechat_code: v.code,
          coupon_id: v.coupon_code
        })
      })
      const data = { loc_name, token, openid, stock_list };
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
     * @param {*} params 
     */
    openCouponDetail() {
      let stock_list = [];
      const {
        loc_name,
        token,
        openid,
        open_some_one,
        open_detail_params
      } = this.data;

      stock_list.push({
        stock_id: open_detail_params[open_some_one].stock_id,
        coupon_code: open_detail_params[open_some_one].coupon_code
      });

      const data = { loc_name, token, openid, stock_list };

      api.doRequestCheckSessionSendCoupon({
        path: 'pay_ad/ad_open_card',
        method: 'POST',
        data,
        success: res => {
          console.log('打开券列表->', res.data)
          res.data.card_list.forEach((v, i) => {
            v.cardId = v.card_id
            v.openCardParams = v.open_params

            delete v.card_id
            delete v.open_params
          })
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
     * @param {*} params 
     */
    moreCouponDetail(e) {
      const open_some_one = Number(e.detail), { receive_success } = this.data;
      this.setData({ open_some_one })
      if (!receive_success) return // 券未领取 将触发领券机制
      this.openCouponDetail()
    },
  }
})
