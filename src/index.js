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
      value: ''
    },
    loc_name: { // 流量位标识
      type: String,
      value: ''
    },
    tag_id: {
      type: String,
      value: ''
    },
  },
  data: {
    flag: false,

    stock_list: [], // 展示的商户券列表
    sendWill: [], // 待领取的商户券列表
    mateAndCouponInfo: null, // 素材和券信息
    sign: '', // 插件所需签名
    open_some_one: 0, // 默认打开第一张券详情
    receive_success: false, // 领券成功
    receive_fail: false,  // 所有券无法领取
    user_click: false,  // 用户点击某张券详情
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
      TIP.loading();
      this.setData({ flag: Tool.getFlag() });
    },
    // 在组件实例被从页面节点树移除时执行
    detached() {

    },
  },
  observers: {
    'stock_max, token, openid, loc_name': function (stock_max, token, openid, loc_name) {
      if (stock_max && token && openid && loc_name) {
        this.getCouponInfo();
      }
    }
  },
  methods: {
    /**
     * 获取优惠券信息
     * @param {*} params 
     */
    getCouponInfo() {
      // if (!this.verificationParameters()) return;
      const { loc_name, token, openid, tag_id, stock_max } = this.data;
      const data = { loc_name, token, openid, tag_id, stock_max };
      api.doRequestCheckSessionSendCoupon({
        path: 'pay_ad/ad_busifavor_assembly',
        method: 'POST',
        data,
        success: res => {
          const stock_list = res.data.stock_list;
          if (stock_list) {
            res.data.sign_type = 1;
            if (res.data.sign_type === 1) {
              const fn = {
                type: 'SENDCOUPON',
                data: stock_list,
                setPlugParams: sign => _this.setData({ sign })
              }
              _this.triggerEvent('_setPlugData', fn);
            } else {
              _this.setData({ sign: res.data.sign })
            }
            const sendWill = stock_list.filter(v => v.send_type === 1);
            stock_list.map(v => {
              v.start_time = Tool.timestampToDay(v.available_begin_time);
              v.end_time = Tool.timestampToDay(v.available_end_time);
            })
            _this.setData({
              stock_list,
              sendWill,
              mateAndCouponInfo: res.data
            }, () => _this.sendCouponShow(stock_list))
          } else {
            TIP.toast(res.data.message || '服务器开小差了～')
          }
          TIP.loaded()
        },
        fail: err => { TIP.loaded(); }
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
        success: res => console.log('优惠券展示上报', res.data),
        fail: err => console.error('优惠券展示上报失败', err)
      })
    },

    /**
     * 领券插件
     * @param {*} params 
     */
    _getcoupon(params) {
      console.log('领券插件', params.detail)
      if (params.detail.errcode === 'OK') {
        const data = params.detail.send_coupon_result, { stock_list } = this.data;
        // 领券结果上报
        // this.sendCouponResult(data);

        const results = data.filter(g => g.code === 'SUCCESS');
        const failArr = data.filter(g => g.code !== 'SUCCESS');
        if (results.length > 0) {
          stock_list.map(v => {
            const sd = results.find(g => g.stock_id === v.stock_id);
            if (sd) v.coupon_code = sd.coupon_code;
          })
        } else {
          TIP.toast(data[0].message)
        }
        if (failArr.length > 0) {
          stock_list.map(v => {
            const ob = failArr.find(g => g.stock_id === v.stock_id);
            if (ob) v.errMsg = ob.message
          })
          if (failArr.length === stock_list.length) {
            _this.setData({ receive_fail: true })
          }
        }
        this.setData({
          stock_list, 
          receive_success: true
        }, () => {
          this.getDetailParams()
        })
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
     * 获取打开券详情的参数
     * @param {*} params 
     */
    getDetailParams() {
      let stockList = [];
      const {
        loc_name,
        token,
        openid,
        open_some_one,
        stock_list, 
        user_click, 
        receive_fail, 
        mateAndCouponInfo 
      } = this.data;

      const msg = stock_list[open_some_one].errMsg;
      if ((msg && user_click) || (msg && receive_fail)) {
        TIP.toast(msg);
        this.setData({ user_click: !user_click })
        return;
      }

      stockList.push({
        stock_id: stock_list[open_some_one].stock_id,
        coupon_code: stock_list[open_some_one].coupon_code
      });

      const data = { loc_name, token, openid, stock_list: stockList };

      if (mateAndCouponInfo.sign_type === 1) {
        const fn = {
          type: 'SHOWDETAIL',
          data,
          setPlugParams: result => _this.openCouponDetail(result)
        }
        _this.triggerEvent('_setPlugData', fn);
      } else {
        api.doRequestCheckSessionSendCoupon({
          path: 'pay_ad/ad_open_card',
          method: 'POST',
          data,
          success: res => {
            if (res.data.card_list) {
              res.data.card_list.forEach((v, i) => {
                v.cardId = v.card_id
                v.openCardParams = v.open_params
                delete v.card_id
                delete v.open_params
              })
              _this.openCouponDetail(res.data.card_list);
            } else {
              TIP.toast(`打开券详情失败 !`);
            }
          },
          fail: err => {}
        })
      }
    },

    /**
     * 点击某一张券
     * @param {*} params 
     */
    moreCouponDetail(e) {
      const open_some_one = Number(e.detail.id), { receive_success } = this.data;
      this.setData({ open_some_one });
      if (!receive_success) return; // 券未领取 将触发领券机制
      this.setData({ user_click: true }, () => this.getDetailParams());
    },

    /**
     * 打开卡券详情页
     * @param {*} params 
     */
    openCouponDetail(cardList) {
      wx.openCard({
        cardList,
        complete: res => {
          console.log('openCard => ', res)
        }
      })
    },

    /**
     * 参数验证
     * @param {*} params 
     */
    verificationParameters() {
      const { loc_name, token, openid, tag_id, stock_max } = this.data, r = /^\+?[1-5]*$/;
      const kong = [
        { key: 'loc_name', value: loc_name },
        { key: 'token', value: token },
        { key: 'openid', value: openid },
        // { key: 'tag_id', value: tag_id }
      ].filter(v => !v.value)[0];
      if (kong) {
        TIP.toast(`缺少必需参数: ${kong.key}`);
        return false;
      };
      if (!r.test(stock_max)) {
        TIP.toast(`传入的 stock_max 有误 !`);
        return false; 
      };
      return true;
    },
  }
})
