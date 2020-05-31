$(document).ready(registration());

function getAuthInfo() {
    let uri = window.location.hostname + "/register";
    let clientId = $("#clientId").text();
    window.location.href = `https://oauth.vk.com/authorize?client_id=${clientId}&redirect_uri=${uri}&display=popup&scope=email&response_type=token&revoke=1`;
}

function registration() {
    if (window.location.hash !== "") {
        let info = getInfo();
        window.location.hash = '';
        console.log(info);
        if (typeof info['error'] === "undefined") {
            VK.Api.call("users.get", {
                users_ids: info['user_id'],
                fields: "bdate,city",
                v: "5.103"
            },
                function(r) {
                    if (r.response) {
                        let resp = r.response[0];
                        $("#surname_field").val(resp.last_name);
                        $("#name_field").val(resp.first_name);
                        if (typeof resp['bdate'] !== "undefined") {
                            $("#birthday_field").val(resp.bdate);
                        };
                        if (typeof resp['city'] !== "undefined") {
                            $("#city_field").val(resp.city.title);
                        }
                    };
                    if (typeof info['email'] !== "undefined") {
                        $("#email_field").val(info.email)
                    }
                });
        }
    }
}

function getInfo() {
    let hash = window.location.hash.slice(1).split("&");
    let info = {};
    for (let i = 0; i < hash.length; ++i) {
        let temp = hash[i].split("=");
        info[temp[0]] = temp[1];
    }
    return info
}
