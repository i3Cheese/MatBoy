$(document).ready(function () {
    InlineEditor
        .create(document.querySelector('#editor'), {

            toolbar: {
                items: [
                    '|',
                    'bold',
                    'italic',
                    'link',
                    'bulletedList',
                    'numberedList',
                    '|',
                    'indent',
                    'outdent',
                    '|',
                    'blockQuote',
                    'undo',
                    'redo'
                ]
            },
            language: 'ru',
            licenseKey: '',

        })
        .then(editor => {
            window.editor = editor;


        })
        .catch(error => {
            console.error('Oops, something gone wrong!');
            console.error('Please, report the following error in the https://github.com/ckeditor/ckeditor5 with the build id and the error stack trace:');
            console.warn('Build id: ytvryc82pkf4-171lbhbpe7s4');
            console.error(error);
        });
    let feedbackForm = $('#feedback-form');
    let submitButton = $('input[type=submit]');
    let titleField = $('#title');
    feedbackForm.submit(function (event) {  // sending a feedback message
        event.preventDefault();
        let title = titleField.val();
        let error = false;
        if (!title) {  // if title is empty
            makeErrorToast('Тема обращения не заполнена');
            error = true;
        }
        let content = editor.getData();
        if (!content) {  // if content is empty
            makeErrorToast('Содержание ображения не заполнено');
            error = true;
        }
        if (!error) {
            submitButton.attr('disabled', true);
            $.ajax({
                url: '/feedback',
                type: 'POST',
                data: {title: title, content: content},
            }).done(function () {  // if sending message is successful
                window.location.href = '/';
            }).fail(function () {  // if sending message failed
                makeErrorToast('Сообщение не доставлено');
            }).always(function () {
                submitButton.attr('disabled', false);
            });
        }
    });
});