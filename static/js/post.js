let submitButton
$(document).ready(function () {
    let postForm = $('#ckeditor-form');
    submitButton = postForm.find('input[type="submit"]');
    let titleInput = $('#title');
    let tourIdInput = $('input#tour-id');
    let tourId = tourIdInput.val();
    let postIdInput = $('input#post-id');
    let now
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
                now = data.post.now;
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
                        if (now && !data.now) {
                            notifications(data, false);
                        } else {
                            window.location.href = `/tournament/${data.tour_id}`
                        }
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
                        if (data.status === 1) { // If publication post now
                            notifications(data, false);
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
