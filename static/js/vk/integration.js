$(document).ready(registration);

function getAuthInfo() {
    let uri = window.location.hostname + window.location.pathname;
    let clientId = $("#clientId").text();
    window.location.href = `https://oauth.vk.com/authorize?client_id=${clientId}&redirect_uri=${uri}&scope=groups&display=page&response_type=token&revoke=1`;
}

function registration() {
    if (window.location.hash !== "") {
        let info = getInfo();
        let vkId = info.user_id;
        $.ajax({
            url: API_URL + `user?vk_id=${vkId}&check=true`,
            type: 'GET',
            async: false
        }).done(function (r) {
            if (r.exist) {
                makeErrorToast("Эта страница уже зарегистрирована")
            } else {
                if (typeof info['error'] === "undefined") {
                   let userId = getUserId();
                   $.ajax({
                       url: API_URL +  `user/${userId}?vk_id=${vkId}`,
                       type: 'PUT',
                       async: false
                   }).done(function(r) {
                       if (r.success) {
                            $("#vk_login_button").prop("onclick", null);
                            $("#vk_login_button").text("Страница успешно привязана");

                            let vkInfo = $("#vk_notification");
                            vkInfo.removeClass("hidden");
                            let vkLink = '';
                            VK.Api.call("groups.getById", {
                                group_id: $("#groupId").text(),
                                fields: 'screen_name',
                                v: "5.103"
                            },
                                function (r) {
                                    if (r.response) {
                                        vkLink = r.response[0].screen_name;
                                        vkInfo.html(`Для того, чтобы получать уведомления через ВКонтакте, 
                                        напишите в сообщения <a href="https://vk.com/${vkLink}">сообщества</a>`)
                                    };
                                }
                            );
                            makeSuccessToast("Страница ВКонтакте привязана к вашему аккаунту")
                       }
                   })
                }
            }
        }
        )
    }
}

function getInfo() {
    let hash = window.location.hash.slice(1).split("&");
    let info = {};
    for (let i = 0; i < hash.length; ++i) {
        let temp = hash[i].split("=");
        info[temp[0]] = temp[1];
    };
    window.location.hash = '';
    return info
}

function getUserId() {
    let path = window.location.pathname.split('/');
    return path[2]
}
