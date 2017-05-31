import moment from 'moment';

export function initialize( /* application */ ) {
    let url = "https://prazza-utils.herokuapp.com/unix";

    $.ajax({
        url: url,
        dataType: 'JSON',
        type: 'GET',
        async: false,
        crossDomain: true,
        success: function(unix) {
            let offset = unix - moment().unix();
            moment.now = function() {
                return +new Date() + offset * 1000;
            };
        },
        failure: function() {}
    });
}

export default {
    name: 'moment-internet-time',
    initialize
};
