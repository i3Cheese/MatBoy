// Base settings
const API_URL = "/api/"



if(typeof(String.prototype.strip) === "undefined")
{
    String.prototype.strip = function(char) 
    {
        return String(this).replace(new RegExp(`^${char}+|${char}+$`, "g"), '');
    };
}



function redirectWithStep(path){
    window.location.href = path;
    // window.location.search = "?" + "return_to=" + window.location.pathname;
}


function addUserEmailField() {
    let last_field = $("#players").children().last().children("input").last();
    let last_id = last_field.attr("id");
    let last_num = Number(last_id.slice(last_id.indexOf("-") + 1));
    if (last_num >= 8){
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
    let last_field = $("#players").children().last();
    let last_id = last_field.attr("id");
    let last_num = Number(last_id.slice(last_id.indexOf("-") + 1));
    if (last_num <= 4) {
        return;
    }
    console.log(last_field);
    if (last_field){
        last_field.remove();
    }
}


$(document).ready(function(){$(".nested-toggler").click(function(event){
        target = $(`#${$(event.target).attr("for")}`);
        target.toggleClass('hidden');
    })
});
