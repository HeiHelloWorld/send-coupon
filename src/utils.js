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
  },
  // 计算时间戳间隔天数
  timestampToNumber(timestamp1, timestamp2) {
    let days = 0, diff = timestamp2 - timestamp1;
    days = Math.floor(diff / (24 * 3600));
    return days;
  }
}
