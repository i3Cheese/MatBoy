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
});



$(document).on('submit', '#edit_password_form', function (event) {
    event.preventDefault();
    let errorInputTemplate = $($('template#error-input-template').html())
    let closeModalButton = $('#close-password-modal');
    $.ajax({
        'url': '/edit-password',
        'type': 'POST',
        'data': $(this).serialize()
    }).always(function () {
        $('.active-error').remove();
    }).done(function (data) {
        closeModalButton.click();
        makeSuccessToast('Пароль успешно изменен');
    }).fail(function (response) {
        let errors = response.responseJSON
        for (let key in errors) {
            let input = $('#' + key);
            let error = errors[key]
            let currentErrorDiv = errorInputTemplate.clone();
            currentErrorDiv.addClass('active-error');
            currentErrorDiv.html(error);
            input.after(currentErrorDiv);
        }
    });
})