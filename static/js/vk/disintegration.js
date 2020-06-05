function VKdisintegration() {
    let userId = getUserId();
    $.ajax({
        url: API_URL +  `user/${userId}`,
        type: 'DELETE',
        async: false
    }).done(function(r) {
        $("#vk_disintegration").prop("onclick", null);
        $("#vk_disintegration").addClass("hidden");
        $("#vk_notifications").addClass("hidden");

        makeSuccessToast("Страница ВКонтакте была отвязана от аккаунта")
    })
}

function getUserId() {
    let path = window.location.pathname.split('/');
    return path[2]
}