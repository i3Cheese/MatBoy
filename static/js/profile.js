$(document).ready(function () {
    let subscribeEmailInput = $('#subscribe-email-input');
    let subscribeVkInput = $('#subscribe-vk-input');
    subscribeEmailInput.bind('change', function () {
        let status
        if (this.checked) {
            status = 1;
        } else {
            status = 0
        }
        $.ajax({
            url: '/subscribe-email-profile',
            type: 'POST',
            data: {status: status}
        });
    });
    subscribeVkInput.bind('change', function () {
        let status
        if (this.checked) {
            status = 1;
        } else {
            status = 0
        }
        $.ajax({
            url: '/subscribe-vk-profile',
            type: 'POST',
            data: {status: status}
        });
    });
})