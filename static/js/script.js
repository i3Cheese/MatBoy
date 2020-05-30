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

String.prototype.format = String.prototype.f = function(){
    var args;
    if (arguments[0] instanceof Object){
        args = arguments[0];
    } else {
        args = arguments;
    }
	return this.replace(/\{(\d+)\}/g, function(m,n){
		return args[n] ? args[n] : m;
	});
};


$.fn.attrPlus = function(name, value){
    this.attr(name, this.attr(name)+value);
}

$.fn.formatHref = function(){
    this.attr('href', this.attr('href').format(arguments))
}


function logData(data){
    console.log(data);
}

function getHref(target){
    // Находит href в элементе или его родителях
    let href = target.attr("href")
    if (typeof(href) === 'undefined'){
        return target.parents("[href]").attr("href")
    } else {
        return href
    }
}

function redirectWithStep(event){
    // Передают в параметрах текущую страницу
    event.preventDefault();
    let path = getHref($(event.target));
    let url = new URL(document.location.href);
    url.pathname = path;
    url.searchParams.set("comefrom", document.location.pathname);
    window.location.href = url;
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

function makeErrorToast(message){
    let toast = $(document.querySelector("#error_toast_template").content).clone().find(".toast");
    toast.find(".message").text(message);
    toast.toast('show');
    $("#toasts").append(toast);
}

function holdErrorResponse(data){
    console.error(data);
    message = data.responseJSON.message;
    if (typeof(message) == "string"){
        makeErrorToast(message);
    } else if (typeof(message) == "object"){
        for (key in message){
            makeErrorToast(message[key]);
        }
    }
}

$(document).on('click', ".nested-toggler", function(event){
    target = $(`#${$(event.target).attr("for")}`);
    target.toggleClass('hidden');
});
