function VKdisintegration() {
    let url = '/vk_disintegration';
    $.ajax({
        url: url,
        type: 'DELETE',
        async: false,
        error: holdErrorResponse,
    }).done(function (r) {
        if (!r.success)
            return;

        $("#vk_notifications").addClass("hidden");
        $("#vk_notification").addClass("hidden");

        $(".vk_menu").load('/vk_integration');  // adding VK integration button

        makeSuccessToast("Страница ВКонтакте была отвязана от аккаунта");
    });
}