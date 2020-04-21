// Base settings
const API_URL = "/api/"



if(typeof(String.prototype.strip) === "undefined")
{
    String.prototype.strip = function(char) 
    {   
        if (char === undefined){
            return String(this).replace(/^\s+|\s+$/g, '');
        } else {
            return String(this).replace(new RegExp(`^${char}+|${char}+$`, "g"), '');
        }
    };
}


$.fn.attrPlus = function(name, value){
    this.attr(name, this.attr(name)+value);
}


function logData(data){
    console.log(data);
}

function getHref(target){
    let href = target.attr("href")
    if (typeof(href) === 'undefined'){
        return target.parents("[href]").attr("href")
    } else {
        return href
    }
}

function redirectWithStep(event){
    window.location.href = getHref($(event.target));
    // window.location.search = "?" + "return_to=" + window.location.pathname;
}
function redirect(event){
    window.location.href = getHref($(event.target));
}


function getForId(target){
    let id= target.attr("for");
    return Number(id.slice(id.indexOf("-") + 1));
}

function getId(target){
    let id= target.attr("id");
    return id.slice(id.indexOf("-") + 1);
}


$(document).on('click', ".nested-toggler", function(event){
    target = $(`#${$(event.target).attr("for")}`);
    target.toggleClass('hidden');
});

