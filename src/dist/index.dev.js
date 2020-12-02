"use strict";

var _request = _interopRequireDefault(require("../tools/demo/utils/request"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _ = require('./utils');

var _this = null;
Component({
  properties: {
    token: {
      // 发券所需token (request-header)
      type: String,
      value: 'BhGDQJ368Ft8iShb6usAH4Xli8w4BerE'
    },
    openid: {
      // 用户open_id (YOUR_OPEN_ID)
      type: String,
      value: 'oiSTd4kj_txKQ8Mio5yUB_JY1EgI'
    },
    stock_max: {
      // 券数量
      type: Number,
      value: 0
    },
    loc_name: {
      // 流量位标识
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
    stock_list: [],
    // 展示的商户券列表
    sendWill: [],
    // 待领取的商户券列表
    sign: '',
    // 插件所需签名
    send_coupon_merchant: '',
    // 发券商户号
    open_some_one: 0,
    // 默认打开第一张券详情
    open_detail_params: [],
    // 打开多张券详情时的缓存数据
    receive_success: false,
    // 领券成功
    sendAll: true // 都可领

  },
  pageLifetimes: {
    show: function show() {// 页面被展示
    },
    hide: function hide() {// 页面被隐藏
    },
    resize: function resize(size) {// 页面尺寸变化
    }
  },
  lifetimes: {
    // 在组件实例进入页面节点树时执行
    attached: function attached() {
      var _this2 = this;

      _this = this;
      this.getAdvData();
      wx.getSystemInfo({
        success: function success() {
          _this2.setData({
            flag: _.getFlag()
          });
        }
      });
    },
    // 在组件实例被从页面节点树移除时执行
    detached: function detached() {}
  },
  methods: {
    // 获取优惠券信息
    getAdvData: function getAdvData() {
      var _this$data = this.data,
          loc_name = _this$data.loc_name,
          token = _this$data.token,
          openid = _this$data.openid,
          tag_id = _this$data.tag_id,
          stock_max = _this$data.stock_max;
      var r = /^\+?[1-5]*$/; // if (!loc_name || !token || !openid || !tag_id) {

      if (!loc_name || !token || !openid) {
        global.tip.toast("\u7F3A\u5C11\u5FC5\u9700\u53C2\u6570");
        return;
      }

      if (!r.test(stock_max)) {
        global.tip.toast("\u4F20\u5165\u7684 stock_max \u6709\u8BEF !");
        return;
      }

      global.tip.loading();

      _request["default"].doRequestCheckSessionSendCoupon({
        path: 'pay_ad/ad_busifavor',
        method: 'POST',
        data: {
          loc_name: loc_name,
          token: token,
          openid: openid,
          tag_id: tag_id,
          stock_max: stock_max
        },
        success: function success(res) {
          console.log('获取优惠券 ', res.data);
          var couponData = res.data.stock_list;

          if (couponData) {
            var sendWill = couponData.filter(function (g) {
              return g.send_type === 1;
            });

            _this.setData({
              sign: res.data.sign,
              send_coupon_merchant: res.data.send_coupon_merchant,
              stock_list: couponData,
              sendWill: sendWill,
              sendAll: sendWill.length === couponData.length
            }, function () {
              _this.sendCouponShow(couponData);
            });
          }

          global.tip.loaded();

          if (res.data.code === -1) {
            global.tip.toast(res.data.message);
          }
        },
        fail: function fail(res) {
          global.tip.loaded();
        }
      });
    },
    // 优惠券展示上报
    sendCouponShow: function sendCouponShow(params) {
      var stock_list = [],
          _this$data2 = this.data,
          token = _this$data2.token,
          openid = _this$data2.openid,
          loc_name = _this$data2.loc_name;
      params.forEach(function (v, i) {
        stock_list.push({
          stock_id: v.stock_id
        });
      });
      var data = {
        loc_name: loc_name,
        token: token,
        openid: openid,
        stock_list: stock_list
      };

      _request["default"].doRequestCheckSessionSendCoupon({
        path: 'pay_ad/ad_show_notice',
        method: 'POST',
        data: data,
        success: function success(res) {
          return console.log('优惠券展示通知', res);
        },
        fail: function fail(err) {
          return console.error('优惠券展示上报失败', err);
        }
      });
    },
    // 领券插件
    _getcoupon: function _getcoupon(params) {
      var _this3 = this;

      console.log('领券插件', params);

      if (params.detail.errcode === 'OK') {
        var data = params.detail.send_coupon_result;
        var _this$data3 = this.data,
            sendAll = _this$data3.sendAll,
            stock_list = _this$data3.stock_list; // 领券结果上报
        // this.sendCouponResult(data);

        var results = data.filter(function (g) {
          return g.code === 'SUCCESS';
        });

        if (results.length) {
          if (!sendAll) {
            stock_list.forEach(function (v, i) {
              var sd = results.find(function (g) {
                return g.stock_id === v.stock_id;
              });
              if (sd) v.coupon_code = sd.coupon_code;
            });
          }

          this.setData({
            open_detail_params: stock_list
          }, function () {
            _this3.openCouponDetail();
          });
        } else {
          global.tip.toast(data[0].message);
        }
      } else {
        global.tip.toast(params.detail.msg);
      }
    },

    /**
     * 领券结果上报
     */
    sendCouponResult: function sendCouponResult(params) {
      var stock_list = [];
      var _this$data4 = this.data,
          loc_name = _this$data4.loc_name,
          token = _this$data4.token,
          openid = _this$data4.openid;
      params.forEach(function (v, i) {
        stock_list.push({
          stock_id: v.stock_id,
          out_request_no: v.out_request_no,
          wechat_code: v.code,
          coupon_id: v.coupon_code
        });
      });
      var data = {
        loc_name: loc_name,
        token: token,
        openid: openid,
        stock_list: stock_list
      };

      _request["default"].doRequestCheckSessionSendCoupon({
        path: 'pay_ad/ad_im',
        method: 'POST',
        data: data,
        success: function success(res) {
          return console.log('领券结果上报通知', res);
        },
        fail: function fail(err) {
          return console.error('上报失败', err);
        }
      });
    },

    /**
     * 打开券详情
     */
    openCouponDetail: function openCouponDetail() {
      var stock_list = [];
      var _this$data5 = this.data,
          loc_name = _this$data5.loc_name,
          token = _this$data5.token,
          openid = _this$data5.openid,
          open_some_one = _this$data5.open_some_one,
          open_detail_params = _this$data5.open_detail_params;
      stock_list.push({
        stock_id: open_detail_params[open_some_one].stock_id,
        coupon_code: open_detail_params[open_some_one].coupon_code
      });

      _request["default"].doRequestCheckSessionSendCoupon({
        path: 'pay_ad/ad_open_card',
        method: 'POST',
        data: {
          loc_name: loc_name,
          token: token,
          openid: openid,
          stock_list: stock_list
        },
        success: function success(res) {
          console.log('打开券列表', res.data);
          res.data.card_list.forEach(function (v, i) {
            v.cardId = v.card_id;
            v.openCardParams = v.open_params;
            delete v.card_id;
            delete v.open_params;
          });

          _this.setData({
            receive_success: true
          });

          wx.openCard({
            cardList: res.data.card_list,
            complete: function complete(res) {
              console.log('openCard => ', res);
            }
          });
        },
        fail: function fail(err) {}
      });
    },

    /**
     * 点击某一张券
     */
    moreCouponDetail: function moreCouponDetail(e) {
      var _this4 = this;

      var open_some_one = Number(e.detail);
      var receive_success = this.data.receive_success;
      if (!receive_success) return; // 券未领取 将触发领券机制

      this.setData({
        open_some_one: open_some_one
      }, function () {
        return _this4.openCouponDetail();
      });
    }
  }
});