module.exports = function(data, horas, minutos){
    //var moment = require('moment')
    //var fd = moment(data).format('DD/MM/YYYY');
    var d = new Date(data);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    d.setHours(horas);
    d.setMinutes(minutos);
    d.setMilliseconds(0);
    d.setSeconds(0);
    return d;
}