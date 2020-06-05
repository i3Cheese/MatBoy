$(document).ready(function () {
    let postForm = $('#ckeditor-form');
    let submitButton = postForm.find('input[type="submit"]');
    let titleInput = $('#title');
    let tourIdInput = $('input#tour-id');
    let tourId = tourIdInput.val();
    let postIdInput = $('input#post-id');
    if (postIdInput.length) {  // If edit post
        let postId = postIdInput.val();
        $.ajax({ // Load data for current post
            url: `/api/post/${postId}`,
            type: 'GET'
        }).done(function (data) {
            console.log(data);
            if ('post' in data) {
                let title = data.post.title;
                let content = data.post.content;
                titleInput.val(title);
                editor.setData(content);
            } else {
                console.log(data);
            }
        })

    }
    postForm.submit(function (event) {
        event.preventDefault();
        let title = titleInput.val()
        let content = editor.getData();
        if (!title) {
            makeErrorToast('Заголовок новости не заполнен');
        }
        if (!content) {
            makeErrorToast('Содержание новости не заполнено');
        }
        if (title && content) {
            submitButton.attr('disabled', true);
            if (postIdInput.length) { // If edit post
                let postId = postIdInput.val();
                $.ajax({
                    url: `/api/post/${postId}`,
                    type: 'PUT',
                    data: postForm.serialize()
                }).done(function (data) {
                    if ('success' in data) {
                        window.location.href = `/tournament/${tourId}`
                    } else {
                        console.log(data);
                        submitButton.attr('disabled', false);
                    }
                })
            } else { // If create post
                $.ajax({
                    url: `/api/post`,
                    type: 'POST',
                    data: postForm.serialize()
                }).done(function (data) {
                    if ('success' in data) {
                        if (data.status === 1) {
                            $.ajax({
                                url: '/notifications_sending',
                                type: 'POST',
                                data: {'tour_id': tourId, "post_id": data.post_id}
                            }).always(function () {
                                submitButton.attr('disabled', false);
                            }).done(function() {
                                window.location.href = `/tournament/${tourId}`
                            })
                        } else {
                            submitButton.attr('disabled', false);
                            window.location.href = `/tournament/${tourId}`
                        }
                    } else {
                        submitButton.attr('disabled', false);
                    }
                });
            }
        }
    });
});