function deleteTeamFromLeagues(team_id) {
    $("#league_team-" + team_id).remove();
}

function declineTeam(team_id) {
    $.ajax({
        type: "PUT",
        url: API_URL + "team/" + team_id,
        data: {
            "status": 1,
            "league.id": 0,
        },
        dataType: 'json',
        success: function () {
            let team = $("#team-" + team_id);

            // меняем цвет границы
            team.removeClass("border-success");
            team.addClass("border-warning");

            // изменяем кнопки контроля
            team.find(".team-decline").addClass("hidden");
            team.find(".team-accept").removeClass("hidden");
            team.find(".team-delete").removeClass("hidden");

            team.find(".status").text("Ожидает подтверждения");

            // Возвращаем возможность выбирать лигу
            let l_selector = team.find(".league_selector");
            l_selector.removeClass('hidden');
            l_selector.find('option[value="0"]').prop('selected', true);

            team.find(".team-league_title").addClass('hidden');

            deleteTeamFromLeagues(team_id);
        },
        error: holdErrorResponse,
    });
}

function acceptTeam(team_id) {
    let team = $("#team-" + team_id);
    let league_selector = team.find(".league_selector");
    let league_id = league_selector.val();
    $.ajax({
        type: "PUT",
        url: API_URL + "team/" + team_id,
        data: {
            "status": 2,
            "league.id": league_id,
            "send_info": true,
        },
        dataType: 'json',
        success: function (data) {
            // меняем цвет границы
            team.addClass("border-success");
            team.removeClass("border-warning");

            // меняем кнопки контроля
            team.find(".team-decline").removeClass("hidden");
            team.find(".team-accept").addClass("hidden");
            team.find(".team-delete").addClass("hidden");

            team.find(".status").text("Учавствует в турнире");

            // убираем возможность выбирать лигу
            league_selector.addClass('hidden');

            // показываем выбранную лигу
            let team_league_title = team.find(".team-league_title");
            team_league_title.removeClass('hidden');
            team_league_title.text(data["team"]["league"]["title"])
            team_league_title.attr("value", data['team']['league']['id'])

            // Добаляем команду в список лиги
            let team_temp = $(document.querySelector("#league_team_template").content).clone();
            let team_li = team_temp.find("li");
            team_li.attr("id", team_li.attr("id") + team_id);
            team_li_a = team_li.find("a");
            team_li_a.formatHref(team_id);
            team_li_a.text(data["team"]["name"]);
            teams_list = $("#league_teams-" + league_id);
            teams_list.append(team_li);
        },
        error: holdErrorResponse,
    });
}

function deleteTeam(team_id) {
    $.ajax({
        type: "DELETE",
        url: API_URL + "team/" + team_id,
        success: function () {
            deleteTeamFromLeagues(team_id);
            $("#team-" + team_id).remove();
        },
        error: holdErrorResponse,
    });
}

// биндим команды к кнопкам контроля команд
$(document).on('click', ".team-decline", function (event) {
    declineTeam(getForId($(event.target)));
});
$(document).on('click', ".team-accept", function (event) {
    acceptTeam(getForId($(event.target)));
});
$(document).on('click', ".team-delete", function (event) {
    deleteTeam(getForId($(event.target)));
});



function addLeagueForm(league_id) {
    // Добавляет форму для создания или редактирования лиги
    if (league_id === undefined) {
        if ($("#league_form-new").length) {
            return;
        }
    }

    // информация о лиги
    let title = "";
    let description = "";
    let chief_email = "";
    let id = "league_form-";
    let league = undefined;
    if (!(league_id === undefined)) {
        // достаём информацию о лиги из элементов
        league = $("#league-" + league_id);
        title = league.find(".league-title").text().strip();
        description = league.find(".league-description").text().strip();
        chief_email = league.find(".league-chief").attr("title").strip();
        id = id + league_id;
    } else {
        id = id + "new";
    }

    let temp_form = $(document.querySelector("#league_form_template").content).clone();
    let form = temp_form.find("form");
    // заполняем существующие данные в форму
    form.find(".editor-title").attr("value", title);
    form.find(".editor-textarea").text(description);
    form.find(".editor-email").attr("value", chief_email);
    form.attr("id", id);
    if (!(league_id === undefined)) {
        // Вставляем форму на место её информации
        league.after(form);
        league.addClass("hidden");
    } else {
        // Добавляем форму в конец списка
        $("#leagues").append(form);
    }
}

function fillLeague(league, info, is_new = false) {
    id = info["id"];
    league.find(".league-description").text(info['description']);

    // Заполняем информацию о старшем по лиге
    let l_chief = league.find(".league-chief");
    l_chief.text(info["chief"]["fullname"]);
    l_chief.attr("title", info["chief"]["email"]);
    l_chief.formatHref(info["chief"]["id"])

    let l_title = league.find(".league-title");
    l_title.text(info["title"]);
    if (is_new) {
        league.attrPlus('id', id);

        // Настраиваем тоглеры
        l_title.attr("for", l_title.attr("for") + id);
        league.find(".league-info").attrPlus("id", id);
        league.find(".league-label_teams").attrPlus("for", id);
        league.find(".league-teams").attrPlus("id", id);

        // Дополняем ссылки
        league.find('.league-manage').formatHref(id);
        league.find('.league-goto').formatHref(id);

        // Подключаем кнопки
        league.find(".league-edit").attrPlus("for", id);
        league.find(".league-delete").attrPlus("for", id);
    }
}


function sendLeagueForm(event) {
    event.preventDefault();

    // Получаем данные из формы
    let form = event.target;
    let title = form.title.value;
    let description = form.description.value;
    let chief_email = form.chief_email.value;

    // Получаем id лиги и турнира
    let form_id = form.getAttribute("id");
    let id = form_id.slice(form_id.indexOf("-") + 1);
    let tour_id = Number($("#tour-id").text());

    if (id == "new") {
        $.ajax({
            type: "POST",
            url: API_URL + "league",
            data: {
                "title": title,
                "description": description,
                "chief.email": chief_email,
                "send_info": true,
                "tournament.id": tour_id,
            },
            dataType: "json",
            success: function (data) {
                let league_temp = $(document.querySelector("#league_template").content).clone();
                let league = league_temp.find(".league");
                let info = data["league"];
                fillLeague(league, info, true);

                // Добавляем возможность выбрать лигу у команд
                let l_option_temp = $(document.querySelector("#league_option_template").content
                                      ).clone();
                let l_option = l_option_temp.find("option");
                l_option.attr("value", info['id']);
                l_option.text(info['title']);
                $(".league_selector").prepend(l_option);

                form.remove();
                $("#leagues").append(league);
            },
            error: holdErrorResponse,
        })
    } else {
        id = Number(id);
        $.ajax({
            type: "PUT",
            url: API_URL + "league/" + id,
            data: {
                "title": title,
                "description": description,
                "chief.email": chief_email,
                "send_info": true,
            },
            dataType: "json",
            success: function (data) {
                let league = $("#league-" + id);
                let info = data["league"];
                fillLeague(league, info, false);

                // Изменяем название в командах где эта лига выбрана
                $(`.league_in[value='${id}']`).text(info['title'])

                form.remove();
                league.removeClass('hidden');
            },
            error: holdErrorResponse,
        })
    }
}

function removeLeagueForm(event) {
    console.log(event);
    event.preventDefault();
    let form = event.target;
    let id = getId($(form));
    if (id != 'new') {
        $("#league-" + id).removeClass("hidden");
    }
    form.remove();
}

function deleteLeague(league_id) {
    $.ajax({
        type: "DELETE",
        url: API_URL + "league/" + league_id,
        success: function () {
            location.reload();
        },
        error: holdErrorResponse,
    });
}

$(document).on('click', '.league-edit', function (event) {
    addLeagueForm(getForId($(event.target)));
});
$(document).on('click', '.league-add', function (event) {
    addLeagueForm();
});
$(document).on('click', '.league-delete', function (event) {
    deleteLeague(getForId($(event.target)));
});
$(document).on('submit', '.league_form', sendLeagueForm);
$(document).on('reset', '.league_form', removeLeagueForm);