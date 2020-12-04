module.exports = {
  getFlag() {
    return true
  },
  // 转换成不要具体时间点
  timestampToDay(timestamp) {
    var date = new Date(timestamp * 1000);
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '.';
    var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    return M + D;
  }
}
