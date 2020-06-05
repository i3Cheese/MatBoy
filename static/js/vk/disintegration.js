function VKdisintegration() {
    let url = '/delete_vk_integration';
    $.ajax({
        url: url,
        type: 'DELETE',
        async: false
    }).done(function (r) {
        if (r.success) {
            $("#vk_disintegration").prop("onclick", null);

            $("#vk_disintegration").addClass("hidden");
            $("#vk_notifications").addClass("hidden");

            $("#vk_integration").load(url);

            makeSuccessToast("Страница ВКонтакте была отвязана от аккаунта")
        }
    })
}