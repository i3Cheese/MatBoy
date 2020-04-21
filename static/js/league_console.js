function addGameForm(game_id) {
    // Добавляет форму для создания или редактирования игры
    let temp_form = $(document.querySelector("#game_form_template").content).clone();
    let form = temp_form.find("form");
    let games = $("#games");
    form.find('.game-start').datepicker();

    if (game_id === undefined) {
        console.log(form);
        if ($("#game_form-new").length) {
            return;
        }
        form.attrPlus("id", 'new');
        games.append(form);
        
    } else {
        $.ajax({
            type: "GET",
            url: API_URL + "game/"+game_id,
            dataType: "json",
            success: function(data){
                console.log(data);
                let info = data['game'];
                form.find(".game-start").attr("value", info["start"]);
                form.find(".game-place").attr("value", info["place"]);
                form.find(".game-judge").attr("value", info["judge"]['email']);
                form.find(`.game-team1 option[value='${info['team1']['id']}']`
                          ).attr("selected", "selected");
                form.find(`.game-team2 option[value='${info['team2']['id']}']`
                          ).attr("selected", "selected");
                form.attrPlus("id", game_id);
                let game = games.find(`#game-${game_id}`);
                game.after(form);
                game.addClass("hidden");
            }
        });
    }
}


function fillGame(game, info, is_new=false){
    id = info["id"];
    let l_title = game.find(".game-title");
    game.find(".game-status").text(
        info["status"] == 2?"Игра успешно завершилась":"Игра планируется");
    l_title.text(`${info["team1"]["name"]} — ${info["team2"]["name"]}`);
    let l_judge = game.find(".game-judge");
    l_judge.text(info["judge"]["fullname"]);
    l_judge.attr("title", info["judge"]["email"]);
    l_judge.attrPlus("href", info["judge"]["id"]);

    game.find(".game-start").text(info['start']?info['start']:'Не определенно');
    game.find(".game-place").text(info["place"]?info['place']:'Не определенно');
    
    if (is_new){
        game.attrPlus('id', id);
        l_title.attrPlus("for", id);
        game.find(".game-info").attrPlus("id", id);
        game.find(".game-manage").attrPlus("href", id)
        game.find(".game-goto").attrPlus("href", id)
    }
}


function sendGameForm(event) {
    let form = event.target;
    event.preventDefault();
    
    let id = form.getAttribute("id");
    let game_id = id.slice(id.indexOf("-") + 1);
    let request = {
        "start": form.start.value,
        "place": form.place.value,
        "judge.email": form.judge_email.value,
        "league.id": Number($("#league_id").text()),
        "team1.id": form.team1.value,
        "team2.id": form.team2.value,
        "send_info": true,}
    if (game_id == "new") {
        $.ajax({
            type: "POST",
            url: API_URL + "game",
            data: request,
            dataType: "json",
            success: function (data) {
                let game_temp = $(document.querySelector("#game_template").content).clone();
                let game = game_temp.find(".game");
                let info = data["game"];
                fillGame(game, info);

                form.remove();
                $("#games").append(game);
            },
            error: logData,
        })
    } else {
        console.log(game_id);
        let id = Number(game_id);
        $.ajax({
            type: "PUT",
            url: API_URL + "game/" + game_id,
            data: request,
            dataType: "json",
            success: function (data) {
                let game = $("#game-"+game_id);
                
                fillGame(game, data['game']);

                form.remove();
                game.removeClass('hidden');
            },
            error: logData,
        })
    }
}


function removeGameForm(event) {
    console.log(event);
    event.preventDefault();
    let form = event.target;
    let id = getId($(form));
    if (id != 'new'){
        $("#game-" + id).removeClass("hidden");
    }
    form.remove();
}

function deleteGame(game_id){
    $.ajax({
        type: "DELETE",
        url: API_URL + "game/" + game_id,
        success: function () {
            location.reload();
        },
    });
}

function getGameId(target){
    return getId(target.parents(".game"))
}

$(document).on('click', '.game-edit', function (event) {
    addGameForm(getGameId($(event.target)));
});
$(document).on('click', '.game-add', function (event) {
    addGameForm();
});
$(document).on('click', '.game-delete', function (event) {
    deleteGame(getGameId($(event.target)));
});
$(document).on('submit', '.game_form', sendGameForm);
$(document).on('reset', '.game_form', removeGameForm);