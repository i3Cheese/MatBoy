function getTeamId(event){
    let id= $(event.target).attr("for");
    return Number(id.slice(id.indexOf("-") + 1));
}

function deleteTeamFromLeagues(team_id){
    $("#league_team-"+team_id).remove();
}

function addTeamToLeague(team_id, league_id){
    $.ajax({
        type: "GET",
        url: API_URL + "team/" + team_id,
        dataType: 'json',
        success: function(data){
            team = $(document.querySelector("#league_team_template").content).clone();
            team_a = team.find("a");
            team_a.attr("href", "/team/"+team_id);
            team_a.text(data["name"]);
            teams_list = $("#league_teams-"+league_id);
            teams_list.append(team);
        },
    });
}

function declineTeam(team_id){
    $.ajax({
        type: "PUT",
        url: API_URL + "team/" + team_id,
        data: {"accepted": false},
        dataType: 'json',
        success: function(){
            let team = $("#team-"+team_id);
            team.removeClass("team-accepted");
            team.addClass("team-waiting");
            team.find(".team-decline").addClass("hidden");
            team.find(".team-accept").removeClass("hidden");
            team.find(".team-delete").removeClass("hidden");
            team.find(".status").text("Ожидает подтверждения");
            team.find(".league_selector").removeClass('hidden');
            team.find(".team_league_title").addClass('hidden');
            deleteTeamFromLeagues(team_id);
        },
    });
}

function acceptTeam(team_id){
    let team = $("#team-"+team_id);
    let league_selector = team.find(".league_selector");
    let league_id = league_selector.val();
    $.ajax({
        type: "PUT",
        url: API_URL + "team/" + team_id,
        data: {"accepted": true,
               "league.id": league_id,},
        dataType: 'json',
        success: function(){
            team.addClass("team-accepted");
            team.removeClass("team-waiting");
            team.find(".team-decline").removeClass("hidden");
            team.find(".team-accept").addClass("hidden");
            team.find(".team-delete").addClass("hidden");
            team.find(".status").text("Учавствует в турнире");
            league_selector.addClass('hidden');
            team.find(".team_league_title").removeClass('hidden');
            addTeamToLeague(team_id, league_id);
        }
    });
}

function deleteTeam(team_id){
    $.ajax({
        type: "DELETE",
        url: API_URL + "team/" + team_id,
        success: function(){
            $("#team-"+team_id).remove();
        },
    });
}


$(".team-decline").click(function(event){
    declineTeam(getTeamId(event));
});

$(".team-accept").click(function(event){
    acceptTeam(getTeamId(event));
});

$(".team-delete").click(function(event){
    deleteTeam(getTeamId(event));
});