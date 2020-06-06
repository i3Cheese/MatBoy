$(document).ready(registration);

function userAuth() {
    // VK auth via Implicit Flow
    let uri = window.location.hostname + window.location.pathname + window.location.search;
    let clientId = $("#clientId").text();
    window.location.href = `https://oauth.vk.com/authorize?client_id=${clientId}&redirect_uri=${uri}&display=page&scope=email&response_type=token&revoke=1`;
}

function registration() {
    if (window.location.hash !== "") {  // checking hash with VK auth info
        let info = getInfo();  // getting info of user
        $.ajax({
            url: API_URL + `user?vk_id=${info.user_id}&check=true`,
            type: 'GET',
            async: false,
            error: holdErrorResponse,
        }).done(function (r) {  // checking an existing VK user page
                if (r.exist) {
                    makeErrorToast("Эта страница уже зарегистрирована")
                } else {
                    if (typeof info['error'] === "undefined") {  // checking correct response in auth
                        let userId = getUserId();
                        $.ajax({
                            url: API_URL + `user/${userId}?vk_id=${vkId}`,
                            type: 'PUT',
                            async: false,
                            error: holdErrorResponse,
                        }).done(function (r) {
                            if (r.success) {
                                // edit page view
                                let button = $("#vk_integration");
                                button.prop("onclick", null);
                                button.addClass("hidden");

                                let vkInfo = $("#vk_notification");
                                vkInfo.removeClass("hidden");
                                let vkLink = '';
                                // getting the screen name of the group with bot
                                VK.Api.call("groups.getById", {
                                        group_id: $("#groupId").text(),
                                        fields: 'screen_name',
                                        v: "5.103"
                                    },
                                    function (r) {  // displaying the explanatory text of VK notifications
                                        if (r.response) {
                                            vkLink = r.response[0].screen_name;
                                            vkInfo.html(`Для того, чтобы получать уведомления через ВКонтакте, 
                                напишите в сообщения <a href="https://vk.com/${vkLink}">сообщества</a>`)
                                        }
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
    // creating a dict with auth info
    for (let i = 0; i < hash.length; ++i) {
        let temp = hash[i].split("=");
        info[temp[0]] = temp[1];
    }
    window.location.hash = '';
    return info
}

function getUserId() {
    // getting user id
    let path = window.location.pathname.split('/');
    return path[2]
}
