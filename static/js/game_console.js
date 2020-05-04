function gameId(){
    return Number($("#game_id").text());
}


function saveGame(redirect=false){
    // Собираем данные
    let rounds_json = [];
    $("#protocol").find(".round_form").each(function(index){
        let form = $(this);
        let round = {'teams': [{}, {},],};
        round.problem = Number(form.find('[name="problem"]').val());
        round.type = Number(form.find('[name="type"]').val());
        round.teams[0].points = Number(form.find('[name="team1_points"]').val());
        round.teams[1].points = Number(form.find('[name="team2_points"]').val());
        round.teams[0].player = Number(form.find('[name="team1_players"]').val());
        round.teams[1].player = Number(form.find('[name="team2_players"]').val());
        round.additional = form.find('[name="additional"]').val();
        rounds_json.push(round); 
    });
    let data = {rounds: rounds_json};
    data.captain_winner = $('[name="captain_winner"]').val();

    // Отправляем данные
    $.ajax({
        type: "PUT",
        url: API_URL + `game/${gameId()}/protocol`,
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(data),
        dataType: "json",
        error: logData,
        success: function(){
            if (redirect){
                window.location.href=`/game/${gameId()}`
            }
        },
        error: holdErrorResponse,
    })
}

function rowCount(){
    // Кол-во раундов
    return Number($("#protocol").find(".row_number:last").text())
}

function addRow(){
    let row =  $(document.querySelector("#protocol_row_template").content).clone().find('tr');
    row.find(".row_number").text(rowCount() + 1);
    $("#protocol").append(row);
}

function recountPoints(event){
    // Устанавливаем кол-во баллов судье
    let row = $(event.target).parents(".round_form");
    let sum = 0;
    row.find(".points_input").each(function(){
        sum += Number(this.value);
    })
    row.find(".judge_points").text(12-sum);
}

$(document).on('click', '.add_round', function(){
    saveGame();
    addRow();
});
$(document).on('click', '.save', function(){
    saveGame();
});
$(document).on('click', '.save_and_quit', function(){
    saveGame(redirect=true);
});
$(document).on('input keyup', '.points_input', recountPoints);