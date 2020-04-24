from app import app
from flask import render_template


@app.errorhandler(400)
def bad_request(error):
    message="Что-то пошло не так. Наш сервис не может обработать такой запрос."
    return render_template("errors/error.html", 
                           error=error, 
                           message=message)
    
    
@app.errorhandler(401)
def unauthorized(error):
    message="Для этого действия требуется авторизация."
    return render_template("errors/error401.html", 
                           error=error, 
                           message=message)
    

@app.errorhandler(403)
def forbidden(error):
    message="Вам запрещено делать то, что вы пытаетесь. Ничего не поделаешь, такие правила."
    return render_template("errors/error.html", 
                           error=error, 
                           message=message)
    

@app.errorhandler(404)
def not_found(error):
    message="Мы не нашли то что вы искали. Или вы искали то чего у нас нет."
    return render_template("errors/error.html", 
                           error=error, 
                           message=message)
