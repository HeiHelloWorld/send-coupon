Component({
  options: {
    styleIsolation: 'isolated'
  },
  properties: {
    mateInfo: {
      type: Object,
      value: {}
    },
    stock_list: {
      type: Object,
      value: []
    },
    stock_max: Number,
  },
  data: {
    coupon_receive: 'https://cdn.haowuji123.com/statics/coupon-receive-cy@2x.png'
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 点击单张券
    _moreCouponDetail(e) {
      const id = e.currentTarget.dataset.id;
      this.triggerEvent('_someOneDetail', {
        id,
        user_click: true
      });
    }
  }
})
