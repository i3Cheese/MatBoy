if(typeof(String.prototype.strip) === "undefined")
{
    String.prototype.strip = function(char) 
    {
        return String(this).replace(new RegExp(`^${char}+|${char}+$`, "g"), '');
    };
}

function joinPath(paths){
    let res=""
    paths.forEach(path => {
        path = path.strip("/");
        res +=  path + "/";
    });
    return res.strip("/");
}


function redirectWithStep(page){
    window.location.pathname=joinPath([page,window.location.pathname,document.location.hash]);
}