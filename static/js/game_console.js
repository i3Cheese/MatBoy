let stat, disabled;

function gameId() {
    return Number($("#game_id").text());
}

function gameStatus() {
    return Number($("#game_status").text());
}

function toggleProtocol(dis) {
    $("#tournament_fieldset").prop("disabled", dis)
    disabled = dis;
}

function changeStatus(st, func) {
    let data = {status: st};
    $.ajax({
        type: "PUT",
        url: API_URL + `game/${gameId()}`,
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(data),
        error: holdErrorResponse,
        success: function () {
            stat = st;
            func();
        },
    });
}

async function saveGame(finish = false) {
    // collecting game info
    let rounds_json = [];
    let make_red = [];
    $("#protocol").find(".round_form").each(function (index) {
        let form = $(this);
        let round = {'teams': [{}, {},],};
        round.problem = Number(form.find('[name="problem"]').val());
        round.type = Number(form.find('[name="type"]').val());
        round.teams[0].points = Number(form.find('[name="team1_points"]').val());
        round.teams[1].points = Number(form.find('[name="team2_points"]').val());
        let team1_player = form.find('[name="team1_players"]');
        let team2_player = form.find('[name="team2_players"]');
        let t1pVal = Number(team1_player.val());
        let t2pVal = Number(team2_player.val());
        if (t1pVal === 0) {
            make_red.push(team1_player);
        }
        if (t2pVal === 0) {
            make_red.push(team2_player);
        }
        round.teams[0].player = t1pVal;
        round.teams[1].player = t2pVal;

        round.teams[0].stars = form.find("[name='team1_stars']").find(".remove").length;
        round.teams[1].stars = form.find("[name='team2_stars']").find(".remove").length;
        round.additional = form.find('[name="additional"]').val();
        rounds_json.push(round);
    });
    if (make_red.length) {
        make_red.forEach(function (v) {
            v.closest('td').addClass('border_red');
        });
        let ans = await confirm("В некотрых раундах не указаны игроки выходившие к доске. Вы уверены, что хотите сохранить?");
        console.log(ans);
        if (!ans) {
            console.log("HERE");
            return false;
        }
    }
    let data = {rounds: rounds_json};
    data.captain_winner = $('[name="captain_winner"]').val();
    data.captain_task = $('[name="captain_task"]').val();

    // sending the game protocol to the server
    $.ajax({
        type: "PUT",
        url: API_URL + `game/${gameId()}/protocol`,
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(data),
        dataType: "json",
        error: holdErrorResponse,
        success: function () {
            makeSuccessToast("Протокол сохранён");
            if (finish) {
                let redirect = function () {
                    window.location.href = window.location.href.strip('/console');
                };
                if (stat === 2) {
                    changeStatus(3, redirect);
                } else {
                    redirect();
                }
            }
        },
    });
    return true;
}

function rowCount() {
    // count of rounds
    return Number($("#protocol").find(".row_number:last").text());
}

function addRow() {
    let row = $(document.querySelector("#protocol_row_template").content).clone().find('tr');
    row.find(".row_number").text(rowCount() + 1);
    $("#protocol").append(row);
}

function recountPoints(event) {
    // setting judge's points
    let row = $(event.target).parents(".round_form");
    let sum = 0;
    row.find(".points_input").each(function () {
        sum += Number(this.value);
    });
    row.find(".judge_points").text(12 - sum);
}

function addStar(event) {
    if (disabled) return;
    let stars = $(event.target).closest(".stars");
    stars.append($(document.querySelector("#star_template").content).clone().find('.star'));
}

function removeStar(event) {
    if (disabled) return;
    $(event.target).remove();
}

$(document).on('click', '.add_round', async function () {
    // adding round
    await saveGame();
    addRow();
});

$(document).on('click', '.save', async function () {
    // saving game
    await saveGame();
});

$(document).on('click', '.end_editing', async function () {
    // function to end editing
    await saveGame(finish = true);
});

$(document).on('click', '.start_editing', async function (event) {
    // function to start editing
    if (stat === 1) {
        changeStatus(2, function () {
            $(event.target).remove();
            toggleProtocol(0);
        });
    } else {
        toggleProtocol(0);
        $(event.target).remove();
    }
});

$(document).on('input keyup', '.points_input', recountPoints);
$(document).on('click', '.star.add', addStar);
$(document).on('click', '.star.remove', removeStar);

$(document).ready( async function (jqs) {
    stat = gameStatus();
    if (stat === 1 || stat === 3)
        toggleProtocol(1); // prohibiting editing
});
