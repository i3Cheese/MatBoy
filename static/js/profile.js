$(document).ready(function () {
    // subscribe checkbox
    let subscribeEmailInput = $('#subscribe-email-input');
    let subscribeVkInput = $('#subscribe-vk-input');
    //  editing email_notifications field in the database
    subscribeEmailInput.bind('change', function () {
        let status;
        if (this.checked) {
            status = 1;
        } else {
            status = 0
        }
        $.ajax({
            url: '/subscribe-email-profile',
            type: 'POST',
            data: {status: status},
            error: holdErrorResponse,
        });
    });
    //  editing vk_notifications field in the database
    subscribeVkInput.bind('change', function () {
        let status;
        if (this.checked) {
            status = 1;
        } else {
            status = 0
        }
        $.ajax({
            url: '/subscribe-vk-profile',
            type: 'POST',
            data: {status: status},
            error: holdErrorResponse,
        });
    });
});


$(document).on('submit', '#edit-password-form', function (event) {
    // start a password changing
    event.preventDefault();
    let errorInputTemplate = $($('template#error-input-template').html());
    let closeModalButton = $('#close-password-modal');
    let submitButton = $('#edit-password-submit');
    submitButton.attr('disabled', true);
    $.ajax({
        url: '/edit-password',
        type: 'POST',
        data: $(this).serialize()
    }).always(function () {
        submitButton.attr('disabled', false);
        $('.active-error').remove();
    }).done(function (data) {
        closeModalButton.click();
        makeSuccessToast('Пароль успешно изменен');
    }).fail(function (response) {
        let errors = response.responseJSON;
        for (let key in errors) {
            let input = $('#' + key);
            let error = errors[key];
            let currentErrorDiv = errorInputTemplate.clone();
            currentErrorDiv.addClass('active-error');
            currentErrorDiv.html(error);
            input.after(currentErrorDiv);
        }
    });
});


$(document).on('submit', '#edit-email-form', function (event) {
    // start a email changing
    event.preventDefault();
    let errorInputTemplate = $($('template#error-input-template').html());
    let closeModalButton = $('#close-email-modal');
    let submitButton = $('#edit-email-submit');
    submitButton.attr('disabled', true);
    $.ajax({
        url: '/edit-email',
        type: 'POST',
        data: $(this).serialize()
    }).always(function () {
        submitButton.attr('disabled', false);
        $('.active-error').remove();
    }).done(function (data) {
        closeModalButton.click();
        makeSuccessToast('Следуйте инструкциям на почте');
    }).fail(function (response) {
        let errors = response.responseJSON;
        for (let key in errors) {
            let input = $('#' + key);
            let error = errors[key];
            let currentErrorDiv = errorInputTemplate.clone();
            currentErrorDiv.addClass('active-error');
            currentErrorDiv.html(error);
            input.after(currentErrorDiv);
        }
    });
});
