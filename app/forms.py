from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Email, ValidationError, EqualTo
from wtforms import BooleanField, TextAreaField, SubmitField, DateField, FieldList, SelectField
from wtforms.fields.html5 import EmailField, IntegerField
from flask_wtf import FlaskForm
import datetime
from data import User, Game, Tournament, create_session
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
                raise ValueError(self.gettext('Не правильный формат даты'))


class RuDataRequired(DataRequired):
    def __init__(self, message="Это поле обязательно"):
        super().__init__(message)


class RuDateField(DateField):
    def process_formdata(self, valuelist):
        if valuelist:
            date_str = ' '.join(valuelist)
            try:
                self.data = datetime.datetime.strptime(date_str, self.format).date()
            except ValueError:
                self.data = None
                raise ValueError(self.gettext('Не правильный формат даты'))


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


class BaseForm(FlaskForm):
    class Meta:
        locales = ['ru_RU', 'ru']


class RegisterForm(BaseForm):
    email = EmailField(
        'E-mail *', validators=[field_data_lower,
                                Email(message="Неправильный формат"),
                                RuDataRequired(),
                                unique_email_validator])
    password = PasswordField('Пароль *', validators=[password_secure_validator])
    password_again = PasswordField(
        'Повторите пароль *', validators=[EqualTo("password", message="Пароли должны совпадать")])
    vk_notifications = BooleanField('Уведомления через ВКонтакте')
    email_notifications = BooleanField('Уведомления по почте')
    surname = StringField('Фамилия *', validators=[
                          field_data_capitalizer, RuDataRequired()])
    name = StringField('Имя *', validators=[
                       field_data_capitalizer, RuDataRequired()])
    patronymic = StringField("Отчество (если есть)", validators=[field_data_capitalizer])
    city = StringField("Город *", validators=[field_data_capitalizer, RuDataRequired()])
    birthday = RuDateField("Дата рождения *", format=DATE_FORMAT,)
    submit = SubmitField('Зарегистрироваться')


class LoginForm(BaseForm):
    email = EmailField(
        "E-mail", validators=[field_data_lower, Email(message="Неправильный формат"),
                              RuDataRequired()])
    password = PasswordField("Пароль", validators=[RuDataRequired()])
    submit = SubmitField("Войти")


class TournamentInfoForm(BaseForm):
    title = StringField("Название *", validators=[RuDataRequired()])
    description = TextAreaField("Дополнительная информация")
    place = StringField("Местро проведения")
    start = NullableDateField("Начало турнира", format=DATE_FORMAT)
    end = NullableDateField("Конец турнира", format=DATE_FORMAT)
    submit = SubmitField("Подтвердить")


class TeamForm(BaseForm):
    name = StringField("Название команды *", validators=[RuDataRequired()])
    motto = TextAreaField("Девиз команды")
    players = FieldList(EmailField(label="E-mail участника *",
                                   validators=[RuDataRequired(),
                                               field_data_lower,
                                               exist_email_validator]
                                   ),
                        "E-mail yчастников",
                        min_entries=4,
                        max_entries=8,)
    submit = SubmitField("Подтвердить")


class PlayerBooleanField(BooleanField):
    def __init__(self, *args, player_id, **kwargs):
        super(PlayerBooleanField, self).__init__(*args, **kwargs)
        self.player_id = player_id


def PrepareToGameForm(game: Game):
    """Generate FlaskForm"""

    class PrepareToGameForm(BaseForm):
        def __init__(self, *args, **kwargs):
            """Add fields to lists"""
            super().__init__(*args, **kwargs)
            for team in self.teams.values():
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

            field = PlayerBooleanField(player.fullname,
                                       default=checked,
                                       player_id=player.id)
            field_name = f"team{i}_player-{player.id}"
            teams[i]['_players'].append(field_name)
            setattr(PrepareToGameForm, field_name, field)
            choices.append((player.id, player.fullname))

        selected_cap = teams_json[i-1].get('captain', {}).get('id', -1)
        selected_deputy = teams_json[i-1].get('deputy', {}).get('id', -1)

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
        setattr(PrepareToGameForm, teams[i]['_captain'], cap)
        setattr(PrepareToGameForm, teams[i]['_deputy'], deputy)

    PrepareToGameForm.teams = teams
    PrepareToGameForm.submit = SubmitField("Перейти к протоколу")

    return PrepareToGameForm()
