$(document).ready(function () {
    let postForm = $('#ckeditor-form');
    let titleInput = $('#title');
    let tourIdInput = $('input#tour-id');
    let tourId = tourIdInput.val();
    let postIdInput = $('input#post-id');
    let statusInput = $('input#status');
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
                let status = data.post.status;
                if (status) {
                    statusInput.prop('checked', true);
                } else {
                    statusInput.prop('checked', false);
                }
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
        let data = postForm.serialize();
        if (!title) {
            makeErrorToast('Заголовок новости не заполнен');
        }
        if (!content) {
            makeErrorToast('Содержание новости не заполнено');
        }
        if (title && content) {
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
                    }
                })
            } else { // If create post
                $.ajax({
                    url: `/api/post`,
                    type: 'POST',
                    data: postForm.serialize()
                }).done(function (data) {
                    if ('success' in data) {
                        window.location.href = `/tournament/${tourId}`
                    } else {
                        console.log(data);
                    }
                });
            }
        }
    });
});