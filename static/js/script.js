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