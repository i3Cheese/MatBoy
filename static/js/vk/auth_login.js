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
            url: API_URL + `user`,
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify({vk_id: vkId, check: true}),
            type: 'GET',
            async: false,
            error: holdErrorResponse,
        }).done(function (r) {  // checking an existing VK user page
                if (r.exist) {
                    makeErrorToast("Эта страница уже зарегистрирована")
                } else {
                    if (typeof info['error'] !== "undefined") // checking correct response in auth
                        return;

                    VK.Api.call("users.get", {  // getting user's info
                            users_ids: info['user_id'],
                            fields: "bdate,city",
                            v: "5.103"
                        },
                        function (r) {
                            if (typeof info['email'] !== "undefined") {
                                $("#email_field").val(info.email)
                            }
                            if (!r.response)
                                return;

                            let resp = r.response[0];

                            // completing registration fields via VK auth
                            $("#surname_field").val(resp.last_name);
                            $("#name_field").val(resp.first_name);
                            if (typeof resp['bdate'] !== "undefined") {
                                $("#birthday_field").val(resp.bdate);
                            }
                            if (typeof resp['city'] !== "undefined") {
                                $("#city_field").val(resp.city.title);
                            }

                        }
                    );
                    // edit page view
                    let button = $("#vk_login_button");
                    button.prop("onclick", null);
                    button.text("Ваша страница успешно привязана");

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
                    // adding VK id to complete registration with comefrom info
                    let href = window.location.pathname + window.location.search;
                    if (window.location.search === '') {
                        href = href + `?user_id=${info.user_id}`
                    } else {
                        href = href + `&user_id=${info.user_id}`
                    }
                    // remove page's refresh
                    window.history.replaceState(null, null, href);
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
