Component({
  properties: {
    stock_list: {
      type: Object,
      value: []
    }
  },
  data: {
    
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 点击单张券
    _moreCouponDetail(e) {
      const id = e.currentTarget.dataset.id;
      this.triggerEvent('_moreCouponDetail', id);
    }
  }
})
