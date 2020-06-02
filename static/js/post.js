$(document).ready(function () {
    let postForm = $('#ckeditor-form');
    let titleInput = $('#title');
    let tourIdInput = $('input#tour-id');
    let tourId = tourIdInput.val();
    let postIdInput = $('input#post-id');
    if (postIdInput.length) {
        let postId = postIdInput.val();
        $.ajax({
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
            makeErrorToast('Содержание новости не заполнено')
        }
        if (title && content) {
            if (postIdInput.length) {
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
            } else {
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
                })
            }
        }
    })
})