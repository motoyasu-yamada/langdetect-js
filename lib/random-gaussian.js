var Random = require("random-js");

/**
 * 正規乱数を生成する。標準正規分布にするには0,1を指定する。
 * @param mu float 平均
 * @param signa float 偏差
 */
var RandomGaussian = function () {
};

RandomGaussian.next_gaussian_odd = false;
RandomGaussian.c     = 0.0;
RandomGaussian.theta = 0.0;
RandomGaussian.next = function() {
    var mu    = 0.0;
    var sigma = 1.0;

    RandomGaussian.next_gaussian_odd = !RandomGaussian.next_gaussian_odd;
    var r = RandomGaussian.next_gaussian_odd ? getNextAtOdd() : getNextAtEven();
    return r;

    function log10(x) {
        return Math.log(x) / Math.LN10;
    }
    function getNextAtOdd() {
        c = Math.sqrt(-2 * log10(Math.random())) * sigma;
        theta = 2 * Math.PI * Math.random();
        return mu + c * Math.sin(theta);
    }
    function getNextAtEven() {
        return mu + c * Math.cos(theta);
    }
};
Random.prototype.nextGaussian = function() {  return RandomGaussian.next(); };

module.exports = Random;