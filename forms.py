from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Email, ValidationError, EqualTo
from wtforms import BooleanField, TextAreaField, SubmitField, DateField
from wtforms.fields.html5 import EmailField, IntegerField
from flask_wtf import FlaskForm
import datetime
from data import User


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
            
def unique_email_validator(form, field):
    """Check if user with same e-mail exist"""
    email = field.data
    if User.query().filter(User.email == email).first():
        raise ValidationError("Пользователь с таким e-mail уже зарегестрирован")


def password_validator(form, field):
    """Check password security"""
    password = field.data
    if len(password) > 50:
        raise ValidationError("Пароль должен быть меньше 50 символов")
    elif len(password) < 8:
        raise ValidationError("Пароль должен быть не меньше 8 символов")


class RegisterForm(FlaskForm):
    email = EmailField('E-mail', validators=[Email(),  DataRequired(), unique_email_validator])
    password = PasswordField('Пароль', validators=[password_validator])
    password_again = PasswordField(
        'Повторите пароль', validators=[EqualTo("password", message="Пароли должны совпадать")])
    surname = StringField('Фамилия', validators=[DataRequired()])
    name = StringField('Имя', validators=[DataRequired()])
    patronymic = StringField("Отчество (если есть)")
    city = StringField("Город", validators=[DataRequired()])
    birthday = DateField("Дата рождения", format="%d.%m.%Y", validators=[DataRequired()])
    submit = SubmitField('Зарегистрироваться')


class LoginForm(FlaskForm):
    email = EmailField("E-mail", validators=[Email(),  DataRequired()])
    password = PasswordField("Пароль", validators=[DataRequired()])
    submit = SubmitField("Войти")
