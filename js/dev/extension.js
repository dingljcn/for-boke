Date.prototype.clone = function() {
    return new Date(this.valueOf());
}

Date.prototype.equalYear = function(that) {
    return this.getFullYear() == that.getFullYear();
}

Date.prototype.equalMonth = function(that) {
    return this.getFullYear() == that.getFullYear() && (this.getMonth() + 1) == (that.getMonth() + 1);
}

Date.prototype.equalWeek = function(that) {
    let _this = this.clone();
    let _that = that.clone();
    _this.setDate(_this.getDate() - _this.getDay()); // 计算出周日
    _that.setDate(_that.getDate() - _that.getDay()); // 计算出周日
    return _this.equalDate(_that);
}

Date.prototype.equalDate = function(that) {
    return this.getFullYear() == that.getFullYear() && (this.getMonth() + 1) == (that.getMonth() + 1) && this.getDate() == that.getDate();
}