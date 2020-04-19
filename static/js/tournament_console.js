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
            console.log(team);
            team.removeClass("team-accepted");
            team.addClass("team-waiting");
            team.find(".team-decline").addClass("hidden");
            team.find(".team-accept").removeClass("hidden");
            team.find(".team-delete").removeClass("hidden");
            team.find(".status").text("Ожидает подтверждения");
            team.find(".league_selector").removeClass('hidden');
            team.find(".team-league_title").addClass('hidden');
            deleteTeamFromLeagues(team_id);
        },
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
            team.addClass("team-accepted");
            team.removeClass("team-waiting");
            team.find(".team-decline").removeClass("hidden");
            team.find(".team-accept").addClass("hidden");
            team.find(".team-delete").addClass("hidden");
            team.find(".status").text("Учавствует в турнире");

            league_selector.addClass('hidden');
            let team_league_title = team.find(".team-league_title");
            team_league_title.removeClass('hidden');
            team_league_title.text(data["team"]["league"]["title"])
            team_league_title.attr("value", data['team']['league']['id'])

            let team_temp = $(document.querySelector("#league_team_template").content).clone();
            let team_li = team_temp.find("li");
            team_li.attr("id", team_li.attr("id") + team_id);
            team_li_a = team_li.find("a");
            team_li_a.attr("href", "/team/" + team_id);
            team_li_a.text(data["team"]["name"]);
            teams_list = $("#league_teams-" + league_id);
            teams_list.append(team_li);
        }
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
    });
}


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
    let title = "";
    let description = "";
    let chief_email = "";
    let id = "league_form-";
    let league = undefined;
    if (!(league_id === undefined)) {
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
    form.find(".editor-title").attr("value", title);
    form.find(".editor-textarea").text(description);
    form.find(".editor-email").attr("value", chief_email);
    form.attr("id", id);
    if (!(league_id === undefined)) {
        league.after(form);
        league.addClass("hidden");
    } else {
        $("#leagues").append(form);
    }
}

function sendLeagueForm(event) {
    console.log(event);
    let form = event.target;
    event.preventDefault();
    let title = form.title.value;
    let description = form.description.value;
    let chief_email = form.chief_email.value;
    let tour_id = Number($("#tour-id").text());
    let id = form.getAttribute("id");
    let league_id = id.slice(id.indexOf("-") + 1);
    if (league_id == "new") {
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
                let league_data = data["league"];
                id = league_data["id"];
                league.attr('id', league.attr("id") + id);

                league.find(".league-description").text(league_data['description']);

                let l_chief = league.find(".league-chief");
                l_chief.text(league_data["chief"]["fullname"]);
                l_chief.attr("title", league_data["chief"]["email"]);
                l_chief.attr("href", l_chief.attr("href")+league_data["chief"]["id"])

                let l_title = league.find(".league-title");
                l_title.text(league_data["title"]);
                l_title.attr("for", l_title.attr("for") + id);

                let l_info = league.find(".league-info");
                l_info.attr("id", l_info.attr("id") + id);

                let l_label_teams = league.find(".league-label_teams");
                l_label_teams.attr("for", l_label_teams.attr("for") + id);

                let l_teams = league.find(".league-teams");
                l_teams.attr("id", l_teams.attr('id')+id);
                let base_team_temp = $(document.querySelector("#league_team_template").content);
                let base_team = base_team_temp.find("li");
                league_data['teams'].forEach(function (team_data) {
                    let team = base_team.clone();
                    team.attr("id", team.attr("id")+team_data["id"]);
                    t_a = team.find('a');
                    t_a.attr('href', t_a.attr('href')+id);
                    t_a.text(team_data["name"]);
                    l_teams.append(t_a);
                });

                league.find(".league-edit").attrPlus("for",id);
                league.find(".league-delete").attrPlus("for",id);

                form.remove();
                $("#leagues").append(league);
            },
            error: logData,
        })
    } else {
        console.log(league_id);
        let id = Number(league_id);
        $.ajax({
            type: "PUT",
            url: API_URL + "league/" + league_id,
            data: {
                "title": title,
                "description": description,
                "chief.email": chief_email,
                "send_info": true,
            },
            dataType: "json",
            success: function (data) {
                let league = $("#league-"+league_id);
                let league_data = data["league"];

                league.find(".league-description").text(league_data['description']);

                let l_chief = league.find(".league-chief");
                l_chief.text(league_data["chief"]["fullname"]);
                l_chief.attr("title", league_data["chief"]["email"]);
                l_chief.attr("href", l_chief.attr("href")+league_data["chief"]["id"])

                let l_title = league.find(".league-title");
                l_title.text(league_data["title"]);
                $(`.league_in[value='${league_id}']`).text(league_data['title'])

                form.remove();
                league.removeClass('hidden');
            },
            error: logData,
        })
    }
}


function removeLeagueForm(event) {
    console.log(event);
    event.preventDefault();
    let form = event.target;
    let id = getId($(form));
    if (id != 'new'){
        $("#league-" + id).removeClass("hidden");
    }
    form.remove();
}


function deleteLeague(league_id){
    $.ajax({
        type: "DELETE",
        url: API_URL + "league/" + league_id,
        success: function () {
            location.reload();
        },
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