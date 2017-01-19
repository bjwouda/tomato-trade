import Ember from 'ember';


export function initialize( /* application */ ) {
    // application.inject('route', 'foo', 'service:foo');

    let url = "http://prazza-utils.herokuapp.com/unix"

    $.ajax({
        url: url,
        dataType: 'JSON',
        type: 'GET',
        async: false,
        crossDomain: true,
        success: function(unix) {
            let offset = unix - moment().unix()
            moment.now = function() {
                return +new Date() + offset * 1000;
            }
        },
        failure: function() {},
    });

}

export default {
    name: 'moment-internet-time',
    initialize
};
