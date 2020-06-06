function VKdisintegration() {
    let url = '/delete_vk_integration';
    $.ajax({
        url: url,
        type: 'DELETE',
        async: false,
        error: holdErrorResponse,
    }).done(function (r) {
        if (r.success) {
            // remove VK disintegration button
            let button = $("#vk_disintegration");
            button.prop("onclick", null);
            button.addClass("hidden");

            $("#vk_notifications").addClass("hidden");

            $("#vk_integration").load(url);  // adding VK integration button

            makeSuccessToast("Страница ВКонтакте была отвязана от аккаунта")
        }
    })
}