from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Email, ValidationError, EqualTo
from wtforms import TextAreaField, SubmitField, DateField, FieldList
from wtforms.fields.html5 import EmailField
from flask_wtf import FlaskForm
import datetime
from app import User

DATA_FORMAT = "%d.%m.%Y"


class NullableDateField(DateField):
    """Native WTForms DateField throws error for empty dates.
    Let fix this so that we could have DateField nullable."""

    def process_formdata(self, valuelist):
        if valuelist:
            date_str = ' '.join(valuelist).strip()
            if date_str == '':
                self.data = None
                return
            try:
                self.data = datetime.datetime.strptime(
                    date_str, self.format).date()
            except ValueError:
                self.data = None
                raise ValueError(self.gettext('Not a valid date value'))


def field_data_lower(form, field):
    """Turns field.data to a lower case"""
    field.data = field.data.lower()


def field_data_capitalizer(form, field):
    """Capitalize field.data"""
    field.data = field.data.capitalize()


def unique_email_validator(form, field):
    """Check if user with same e-mail exist"""
    email = field.data.lower()
    if User.query.filter(User.email == email).first():
        raise ValidationError(
            "Пользователь с таким e-mail уже зарегестрирован")


def exist_email_validator(form, field):
    """Check if user with the e-mail exist"""
    email = field.data.lower()
    if not User.query.filter(User.email == email).first():
        raise ValidationError(
            "Пользователь не найден")


def password_secure_validator(form, field):
    password = field.data
    if len(password) > 50:
        raise ValidationError("Пароль должен быть меньше 50 символов")
    elif len(password) < 8:
        raise ValidationError("Пароль должен быть не меньше 8 символов")


class RegisterForm(FlaskForm):
    email = EmailField(
        'E-mail', validators=[field_data_lower, Email(), DataRequired(), unique_email_validator])
    password = PasswordField('Пароль', validators=[password_secure_validator])
    password_again = PasswordField(
        'Повторите пароль', validators=[EqualTo("password", message="Пароли должны совпадать")])
    surname = StringField('Фамилия', validators=[
                          field_data_capitalizer, DataRequired()])
    name = StringField('Имя', validators=[
                       field_data_capitalizer, DataRequired()])
    patronymic = StringField("Отчество (если есть)", validators=[
                             field_data_capitalizer])
    city = StringField("Город", validators=[
                       field_data_capitalizer, DataRequired()])
    birthday = DateField("Дата рождения", format=DATA_FORMAT,
                         validators=[DataRequired()])
    submit = SubmitField('Зарегистрироваться')


class LoginForm(FlaskForm):
    email = EmailField(
        "E-mail", validators=[field_data_lower, Email(), DataRequired()])
    password = PasswordField("Пароль", validators=[DataRequired()])
    submit = SubmitField("Войти")


class TournamentInfoForm(FlaskForm):
    title = StringField("Название", validators=[DataRequired()])
    description = TextAreaField("Дополнительная информация")
    place = StringField("Местро проведения")
    start = NullableDateField("Начало турнира", format=DATA_FORMAT)
    end = NullableDateField("Конец турнира", format=DATA_FORMAT)
    submit = SubmitField("Подтвердить")


class ListItemEmailField(EmailField):
    """Класс для добавления html аргументов во вложенные поля"""

    def __init__(self, arguments: dict = {}, **kwargs):
        super().__init__(**kwargs)
        self.arguments = arguments

    def __call__(self, **kwargs):
        return super().__call__(**self.arguments)


class TeamForm(FlaskForm):
    name = StringField("Название команды", validators=[DataRequired()])
    motto = TextAreaField("Девиз команды")
    players = FieldList(ListItemEmailField(arguments={"class": u"form__field-input",
                                                      "autocomplete": u"offfff",
                                                      "type": u"e-m-a-i-l"},
                                           label="E-mail участника",
                                           validators=[DataRequired(),
                                                       field_data_lower,
                                                       exist_email_validator]
                                           ),
                        "Участники",
                        min_entries=4,
                        max_entries=8,)
    submit = SubmitField("Подтвердить")
