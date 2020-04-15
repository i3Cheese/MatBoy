from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Email, ValidationError, EqualTo
from wtforms import BooleanField, TextAreaField, SubmitField, DateField, FieldList
from wtforms.fields.html5 import EmailField, IntegerField
from flask_wtf import FlaskForm
import datetime
from data import User, Tournament, create_session
from config import config

DATE_FORMAT = config.DATE_FORMAT


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
    session = create_session()
    if session.query(User).filter(User.email == email).first():
        raise ValidationError(
            "Пользователь с таким e-mail уже зарегестрирован")


def exist_email_validator(form, field):
    """Check if user with the e-mail exist"""
    email = field.data.lower()
    session = create_session()
    if not session.query(User).filter(User.email == email).first():
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
        'E-mail', validators=[field_data_lower, Email(),  DataRequired(), unique_email_validator])
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
    birthday = DateField("Дата рождения", format=DATE_FORMAT,
                         validators=[DataRequired()])
    submit = SubmitField('Зарегистрироваться')


class LoginForm(FlaskForm):
    email = EmailField(
        "E-mail", validators=[field_data_lower, Email(),  DataRequired()])
    password = PasswordField("Пароль", validators=[DataRequired()])
    submit = SubmitField("Войти")


class TournamentInfoForm(FlaskForm):
    title = StringField("Название", validators=[DataRequired()])
    description = TextAreaField("Дополнительная информация")
    place = StringField("Местро проведения")
    start = NullableDateField("Начало турнира", format=DATE_FORMAT)
    end = NullableDateField("Конец турнира", format=DATE_FORMAT)
    submit = SubmitField("Подтвердить")


class TeamForm(FlaskForm):
    name = StringField("Название команды", validators=[DataRequired()])
    motto = TextAreaField("Девиз команды")
    players = FieldList(EmailField(label="E-mail участника",
                                   validators=[DataRequired(),
                                               field_data_lower,
                                               exist_email_validator]
                                   ),
        "Участники",
        min_entries=4,
        max_entries=8,)
    submit = SubmitField("Подтвердить")
