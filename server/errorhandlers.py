from server import app
from flask import render_template


@app.errorhandler(400)
def bad_request(error):
    message = "Что-то пошло не так. Наш сервис не может обработать такой запрос."
    return render_template("errors/error.html",
                           error=error,
                           message=message)


@app.errorhandler(401)
def unauthorized(error):
    message = "Для этого действия требуется авторизация."
    return render_template("errors/error401.html",
                           error=error,
                           message=message)


@app.errorhandler(403)
def forbidden(error):
    message = "Вам запрещено здесь быть. Ничего не поделаешь, такие правила."
    return render_template("errors/error.html",
                           error=error,
                           message=message)


@app.errorhandler(404)
def not_found(error):
    return render_template('react_index.html')
    message = "Мы не нашли то, что Вы искали. Или Вы искали то, чего у нас нет."
    return render_template("errors/error.html",
                           error=error,
                           message=message)


@app.errorhandler(500)
def server_error(error):
    message = "У нас что-то сломалось. Сообщите нам об этом."
    return render_template('errors/error.html',
                           error=error,
                           message=message)
