from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Email, ValidationError, EqualTo
from wtforms import TextAreaField, SubmitField, DateField, FieldList, SelectField
from wtforms import FormField
from wtforms.fields.html5 import EmailField
from flask_wtf import FlaskForm, RecaptchaField, Recaptcha
import datetime
from data import User, Game, get_session
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
                raise ValueError(self.gettext('Неправильный формат даты'))


class RuDataRequired(DataRequired):
    """DataRequired but with russian message"""

    def __init__(self, message="Это поле обязательно"):
        super().__init__(message)


class RuDateField(DateField):
    """DateField but with russian message"""

    def process_formdata(self, valuelist):
        if valuelist:
            date_str = ' '.join(valuelist)
            try:
                self.data = datetime.datetime.strptime(
                    date_str, self.format).date()
            except ValueError:
                self.data = None
                raise ValueError(self.gettext('Неправильный формат даты'))


class FillWith:
    """
    Check that other field isn't empty if this field isn't empty

    :param fieldname:
        The name of the other field to compare to.
    :param message:
        Error message to raise in case of a validation error. Can be
        interpolated with `%(other_label)s` and `%(other_name)s` to provide a
        more helpful error.
    """

    def __init__(self, fieldname, other_msg=None, this_msg=None):
        self.fieldname = fieldname
        self.other_msg = other_msg
        self.this_msg = this_msg

    def __call__(self, form, field):
        if not field.data:
            return

        try:  # Get other form field
            other = form[self.fieldname]
        except KeyError:
            raise ValidationError(field.gettext(
                "Invalid field name '%s'.") % self.fieldname)
        if not other.data:
            d = {
                'other_label': hasattr(other, 'label') and other.label.text or self.fieldname,
                'other_name': self.fieldname,
                'this_label': hasattr(field, 'label') and field.label.text or field.name,
                'this_name': field.name,
            }
            # Add error to other field
            other_msg = self.other_msg
            if other_msg is None:
                other_msg = field.gettext(
                    'Поле "%(this_label)s" заполнено; так и должно быть')
            other.errors.append(other_msg)

            # Raise error
            this_msg = self.this_msg
            if this_msg is None:
                this_msg = field.gettext(
                    'Поле "%(other_label)s" должно быть заполнено')
            raise ValidationError(this_msg % d)


def field_data_lower(form, field):
    """Turns field.data to a lower case"""
    field.data = field.data.lower()


def field_data_capitalizer(form, field):
    """Capitalize field.data"""
    field.data = field.data.capitalize()


def unique_email_validator(form, field):
    """Check if user with same e-mail exist"""
    email = field.data.lower()
    session = get_session()
    if session.query(User).filter(User.email == email).first():
        raise ValidationError(
            "Пользователь с таким e-mail уже зарегистрирован")


def exist_email_validator(form, field):
    """Check if user with the e-mail exist"""
    email = field.data.lower()
    session = get_session()
    if not session.query(User).filter(User.email == email).first():
        raise ValidationError(
            "Пользователь не найден")


def password_secure_validator(form, field):
    password = field.data
    if len(password) > 50:
        raise ValidationError("Пароль должен быть менее 50 символов")
    elif len(password) < 8:
        raise ValidationError("Пароль должен быть не менее 8 символов")


class BaseForm(FlaskForm):
    class Meta:
        locales = ['ru_RU', 'ru']
        csrf = False


class RegisterForm(BaseForm):
    email = EmailField(
        'E-mail *', validators=[field_data_lower,
                                Email(message="Неправильный формат"),
                                RuDataRequired(),
                                unique_email_validator])
    password = PasswordField(
        'Пароль *', validators=[password_secure_validator])
    password_again = PasswordField(
        'Повторите пароль *', validators=[EqualTo("password", message="Пароли должны совпадать")])
    email_notifications = BooleanField('Уведомления по почте')
    surname = StringField('Фамилия *', validators=[
        field_data_capitalizer, RuDataRequired()])
    name = StringField('Имя *', validators=[
        field_data_capitalizer, RuDataRequired()])
    patronymic = StringField("Отчество (если есть)", validators=[
        field_data_capitalizer])
    city = StringField(
        "Город *", validators=[field_data_capitalizer, RuDataRequired()])
    birthday = RuDateField("Дата рождения *")
#     recaptcha = RecaptchaField(
#         validators=[Recaptcha(message='Это поле обязательно')])
    submit = SubmitField('Зарегистрироваться')


class LoginForm(BaseForm):
    email = EmailField(
        "E-mail", validators=[field_data_lower, Email(message="Неправильный формат"),
                              RuDataRequired()])
    password = PasswordField("Пароль", validators=[RuDataRequired()])
    submit = SubmitField("Войти")


class BasicUserForm(BaseForm):
    email = EmailField('E-mail *', validators=[field_data_lower,
                                               Email(message="Неправильный формат"),
                                               RuDataRequired()])

    def required_if_new(form, field):
        if form.__new_email:
            RuDataRequired()(form, field)

    surname = StringField('Фамилия *', validators=[field_data_capitalizer, required_if_new])
    name = StringField('Имя *', validators=[field_data_capitalizer, required_if_new])
    patronymic = StringField("Отчество (если есть)", validators=[field_data_capitalizer,])
    city = StringField("Город *", validators=[field_data_capitalizer, required_if_new])
    birthday = NullableDateField("Дата рождения *", format=DATE_FORMAT, validators=[required_if_new])

    __new_email = False

    __required_if_new = ['surname', 'name', 'city', 'birthday']

    def __init__(self, *args, meta=None, **kwargs):
        if meta is None:
            meta = {'csrf': False}
        else:
            meta['csrf'] = False
        super(BasicUserForm, self).__init__(*args, meta=meta, **kwargs)

    def validate_email(form, field):
        session = get_session()
        user = session.query(User).filter_by(email=field.data.lower()).first()
        form.__new_email = user is None




class ResetPasswordStep1(BaseForm):
    email = EmailField(
        "E-mail", validators=[field_data_lower, Email(message="Неправильный формат"),
                              RuDataRequired(), exist_email_validator])
    submit = SubmitField("Восстановить")


class EditPassword(BaseForm):
    password = PasswordField(
        'Новый пароль *', validators=[RuDataRequired(), password_secure_validator])
    password_again = PasswordField(
        'Повторите пароль *', validators=[RuDataRequired(),
                                          EqualTo("password", message="Пароли должны совпадать")])
    submit = SubmitField("Изменить пароль")


class EditEmail(BaseForm):
    email = EmailField(
        "E-mail *", validators=[field_data_lower, Email(message="Неправильный формат"),
                                RuDataRequired(), unique_email_validator])
    submit = SubmitField("Изменить почту")


class PlayerBooleanField(BooleanField):
    def __init__(self, *args, player_id, **kwargs):
        super(PlayerBooleanField, self).__init__(*args, **kwargs)
        self.player_id = player_id


def PrepareToGameForm(game: Game):
    """Generate FlaskForm for game"""

    class PrepareToGameForm(BaseForm):
        def __init__(self, *args, **kwargs):
            """Add fields to lists"""
            super().__init__(*args, **kwargs)
            for team in self.teams.values():  # Add initialized fields to dict
                team['players'] = []
                for field_name in team['_players']:
                    team['players'].append(getattr(self, field_name))

                team['captain'] = getattr(self, team['_captain'])
                team['deputy'] = getattr(self, team['_deputy'])

    # All operations with the protocol assume that it may be empty or incomplete
    teams_json = (game.protocol or {}).get('teams', [{}, {}])

    teams = {}
    for i, team in enumerate((game.team1, game.team2,), 1):
        teams[i] = dict()
        teams[i]['team'] = team
        teams[i]['_players'] = []
        choices = []

        selected_players = teams_json[i - 1].get('players', None)
        if selected_players is None:
            selected_ids = None
        else:
            selected_ids = [p['id'] for p in selected_players]

        for player in team.players:
            # Only previosly selected players are checked
            # If it's the first time all players are checked
            checked = ""
            if selected_ids is None or player.id in selected_ids:
                checked = "checked"

            # Add attr to class
            field = PlayerBooleanField(player.fullname,
                                       default=checked,
                                       player_id=player.id)
            field_name = f"team{i}_player-{player.id}"
            teams[i]['_players'].append(field_name)
            setattr(PrepareToGameForm, field_name, field)
            choices.append((player.id, player.fullname))

        selected_cap = teams_json[i - 1].get('captain', {}).get('id', -1)
        selected_deputy = teams_json[i - 1].get('deputy', {}).get('id', -1)

        # Choisen on the first place
        cap_choices = sorted(choices, reverse=True,
                             key=lambda p: p[0] == selected_cap)
        deputy_choices = sorted(choices, reverse=True,
                                key=lambda p: p[0] == selected_deputy)

        cap = SelectField(u"Капитан", coerce=int, choices=cap_choices)
        deputy = SelectField(u"Заместитель капитана",
                             coerce=int, choices=deputy_choices)
        teams[i]['_captain'] = f'team{i}_captain'
        teams[i]['_deputy'] = f'team{i}_deputy'

        # Add attr to class
        setattr(PrepareToGameForm, teams[i]['_captain'], cap)
        setattr(PrepareToGameForm, teams[i]['_deputy'], deputy)

    PrepareToGameForm.teams = teams
    PrepareToGameForm.submit = SubmitField("Перейти к протоколу")

    return PrepareToGameForm()
