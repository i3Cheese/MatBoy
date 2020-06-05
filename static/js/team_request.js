const MIN_FIELDS = 4;
const MAX_FIELDS = 8;


function addUserEmailField() {
    // Добавляет поле если их меньше MAX_FIELDS

    let last_field = $("#players").children().last().children("input").last();
    let last_id = last_field.attr("id");
    let last_num = Number(last_id.slice(last_id.indexOf("-") + 1));
    if (last_num >= MAX_FIELDS - 1) {
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
    // Удаляем последнее поле если их осталось > MIN_FIELDS

    let last_li = $("#players").children().last();
    let last_field = last_li.children("input").last();
    let last_id = last_field.attr("id");
    let last_num = Number(last_id.slice(last_id.indexOf("-") + 1));
    if (last_num < MIN_FIELDS) {
        return;
    }
    if (last_li) {
        last_li.remove();
    }
}
