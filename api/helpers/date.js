import Moment from "moment-timezone";

export default {
  getTimezoneOffset: function(tz) {
    let offset = Moment.tz(tz).utcOffset() / 60;
    let offset_abs = Math.abs(offset);
    let hrs = "" + parseInt(Number(offset_abs));
    let min = "" + Math.round((Number(offset_abs) - hrs) * 60);
    if (hrs.length === 1) hrs = "0" + hrs;
    if (min.length === 1) min = "0" + min;
    return offset > 0 ? "+" + hrs + ":" + min : "-" + hrs + ":" + min;
  },

  getUtcDateIso: function(d) {
    let year = "" + d.getUTCFullYear();
    let month = "" + (d.getUTCMonth() + 1);
    let date = "" + d.getUTCDate();
    let hours = "" + d.getUTCHours();
    let minutes = "" + d.getUTCMinutes();
    let seconds = "" + d.getUTCSeconds();

    if (month.length === 1) month = "0" + month;
    if (date.length === 1) date = "0" + date;
    if (hours.length === 1) hours = "0" + hours;
    if (minutes.length === 1) minutes = "0" + minutes;
    if (seconds.length === 1) seconds = "0" + seconds;

    return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}Z`;
  },
  getDateIso: function(d) {
    let year = "" + d.getFullYear();
    let month = "" + (d.getMonth() + 1);
    let date = "" + d.getDate();
    let hours = "" + d.getHours();
    let minutes = "" + d.getMinutes();
    let seconds = "" + d.getSeconds();

    if (month.length === 1) month = "0" + month;
    if (date.length === 1) date = "0" + date;
    if (hours.length === 1) hours = "0" + hours;
    if (minutes.length === 1) minutes = "0" + minutes;
    if (seconds.length === 1) seconds = "0" + seconds;

    return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}Z`;
  }
};
