
function addUserEmailField() {
    let last_field = $("#players").children().last().children("input").last();
    let last_id = last_field.attr("id");
    let last_num = Number(last_id.slice(last_id.indexOf("-") + 1));
    if (last_num >= 7){
        return;
    }

    let players = $("#players");
    let field = $(document.querySelector("template#user_email_field").content
                  ).children("li").clone();

    let new_id = last_id.slice(0, last_id.indexOf("-") + 1) + (last_num + 1);
    field.children("input").attr("id", new_id);
    field.children("input").attr("name", new_id);
    players.append(field);
}

function deleteUserEmailField() {
    let last_li = $("#players").children().last();
    let last_field = last_li.children("input").last();
    let last_id = last_field.attr("id");
    let last_num = Number(last_id.slice(last_id.indexOf("-") + 1));
    if (last_num < 4) {
        return;
    }
    if (last_li){
        last_li.remove();
    }
}
