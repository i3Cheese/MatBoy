if (typeof (String.prototype.strip) === "undefined") {
    String.prototype.strip = function (char) {
        return String(this).replace(new RegExp(`^${char}+|${char}+$`, "g"), '');
    };
}


function redirectWithStep(path) {
    window.location.href = path;
    // window.location.search = "?" + "return_to=" + window.location.pathname;
}


function addUserEmailField() {
    let players = $("#players");
    let field = $(document.querySelector("template#user_email_field").content
                  ).children("li").clone();

    let last_field = $("#players").children().last().children("input").last();
    let last_id = last_field.attr("id");
    console.log(last_field);
    let last_num = Number(last_id.slice(last_id.indexOf("-") + 1));
    let new_id = last_id.slice(0, last_id.indexOf("-") + 1) + (last_num + 1);
    field.children("label").attr("for", new_id);
    field.children("input").attr("id", new_id);
    field.children("input").attr("name", new_id);
    players.append(field);
}

function deleteUserEmailField() {
    let last_field = $("#players").children().last();
    console.log(last_field);
    if (last_field){
        last_field.remove();
    }
}