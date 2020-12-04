Component({
  options: {
    styleIsolation: 'isolated'
  },
  properties: {
    stock_list: {
      type: Object,
      value: []
    }
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
      this.triggerEvent('_someOneDetail', id);
    }
  }
})
