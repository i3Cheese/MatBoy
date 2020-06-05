$(document).ready(registration);

function getAuthInfo() {
    let uri = window.location.hostname + window.location.pathname;
    let clientId = $("#clientId").text();
    window.location.href = `https://oauth.vk.com/authorize?client_id=${clientId}&redirect_uri=${uri}&display=page&response_type=token&revoke=1`;
}

function registration() {
    if (window.location.hash !== "") {
        let info = getInfo();
        console.log(info);
        $.ajax({
            url: API_URL + `user?vk_id=${info.user_id}&check=true`,
            type: 'GET',
            async: false
        }).done(function (r) {
            if (r.exist) {
                makeErrorToast("Эта страница уже зарегистрирована")
            } else {
                if (typeof info['error'] === "undefined") {
                    console.log('a')
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
