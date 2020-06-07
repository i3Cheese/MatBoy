from flask import Blueprint, request, url_for, make_response, jsonify, render_template, redirect
from flask import abort, flash
from flask_login import login_required, current_user
from flask_mail import Message
from data import User, Tournament, Post, create_session
from config import config
from app import send_message, send_messages
from app.forms import EditPassword, EditEmail
from app.token import generate_confirmation_token_reset_email, confirm_token_edit_email
from string import ascii_letters, digits
from random import choice
from threading import Thread
import bot

blueprint = Blueprint('web_utils',
                      __name__,
                      template_folder=config.TEMPLATES_FOLDER,
                      static_folder=config.STATIC_FOLDER,
                      )


@blueprint.route('/edit-password', methods=['POST'])
@login_required
def edit_password():
    """Function for changing password from personal account"""
    edit_password_form = EditPassword()
    if edit_password_form.validate_on_submit():
        session = create_session()
        password = edit_password_form.password.data
        user = session.query(User).get(current_user.id)
        user.set_password(password)
        session.commit()
        return make_response(jsonify({'success': 'ok'}), 200)
    else:
        return make_response(jsonify(edit_password_form.errors), 400)


@blueprint.route('/edit-email', methods=['POST', 'GET'])
@blueprint.route('/edit-email/<string:token>', methods=['POST', 'GET'])
@login_required
def edit_email(token=None):
    """Function for changing email from personal account"""
    if request.method == 'POST' and not token:
        edit_email_form = EditEmail()
        if edit_email_form.validate_on_submit():
            old_email = current_user.email
            new_email = edit_email_form.email.data
            token = generate_confirmation_token_reset_email(old_email, new_email)
            msg = Message(
                subject='Смена почты - MatBoy',
                recipients=[new_email],
                sender=config.MAIL_DEFAULT_SENDER,
                html=render_template('./mails/email/edit_email.html', token=token)
            )
            thr_email = Thread(target=send_message, args=[msg])
            thr_email.start()
            return make_response(jsonify({'success': 'ok'}), 200)
        else:
            return make_response(jsonify(edit_email_form.errors), 400)
    elif request.method == 'GET' and token:
        data = confirm_token_edit_email(token)
        if not data:
            return redirect(url_for('web_pages.index_page'))
        old_email = data['old_email']
        new_email = data['new_email']
        session = create_session()
        user = session.query(User).get(current_user.id)
        if user.email != old_email:
            abort(403)
        user.email = new_email
        session.commit()
        flash('Почта успешно изменена', 'success')
        return redirect(url_for('web_pages.index_page'))
    abort(404)


@blueprint.route('/upload-image', methods=['POST'])
@login_required
def upload_image_creator():
    """Load images from ck-editor"""
    image = request.files.get('upload')
    type_img = image.filename.split('.')[-1]
    filename = ''.join(choice(ascii_letters + digits) for _ in range(50)) + '.' + type_img
    url_image = './static/img/' + filename
    image.save(url_image)
    return make_response(jsonify({
        'uploaded': 1,
        'fileName': filename,
        'url': url_for('static', filename='img/{0}'.format(filename))
    }))


@blueprint.route('/subscribe-email-tour', methods=['POST'])
@blueprint.route('/subscribe-email-profile', methods=['POST'])
@login_required
def subscribe_email():
    """Function for enable subscribe news by email"""
    try:
        if 'status' in request.form:
            session = create_session()
            status = request.form.get('status')
            status = bool(int(status))
            user = session.query(User).get(current_user.id)
            if request.path == '/subscribe-email-tour' and 'tour_id' in request.form:
                tour_id = request.form.get('tour_id')
                tour = session.query(Tournament).get(tour_id)
                if not tour:
                    raise AttributeError
                if status:
                    if user not in tour.users_subscribe_email:
                        tour.users_subscribe_email.append(user)
                else:
                    if user in tour.users_subscribe_email:
                        tour.users_subscribe_email.remove(user)
                session.merge(tour)
                session.merge(user)
            elif request.path == '/subscribe-email-profile':
                if status:
                    user.email_notifications = True
                else:
                    user.email_notifications = False
            else:
                raise AttributeError
            session.commit()
            return jsonify({'success': 'ok'})
        else:
            raise AttributeError
    except AttributeError:
        return jsonify({'error': 'Invalid response'})


@blueprint.route('/subscribe-vk-tour', methods=['POST'])
@blueprint.route('/subscribe-vk-profile', methods=['POST'])
@login_required
def subscribe_vk():
    """Function for enable subscribe news by vk"""
    try:
        if 'status' in request.form:
            session = create_session()
            status = request.form.get('status')
            status = bool(int(status))
            user = session.query(User).get(current_user.id)
            if not user.integration_with_VK:
                return jsonify({'error': 'User not integration vk'})
            if request.path == '/subscribe-vk-tour' and 'tour_id' in request.form:
                tour_id = request.form.get('tour_id')
                tour = session.query(Tournament).get(tour_id)
                if not tour:
                    raise AttributeError
                if status:
                    if user not in tour.users_subscribe_vk:
                        tour.users_subscribe_vk.append(user)
                else:
                    if user in tour.users_subscribe_vk:
                        tour.users_subscribe_vk.remove(user)
                session.merge(tour)
                session.merge(user)
            elif request.path == '/subscribe-vk-profile':
                if status:
                    user.vk_notifications = True
                else:
                    user.vk_notifications = False
            else:
                raise AttributeError
            session.commit()
            return jsonify({'success': 'ok'})
        else:
            raise AttributeError
    except AttributeError:
        return jsonify({'error': 'Invalid response'})


@blueprint.route('/notifications_sending', methods=['POST'])
def notifications_sending():
    """Function for notifications subscribed users"""
    data = request.form

    session = create_session()
    tour = session.query(Tournament).filter(Tournament.id == data.get('tour_id')).first()
    post = session.query(Post).filter(Post.id == data.get('post_id')).first()

    subscribe_email = list(filter(lambda user: user.email_notifications,
                                  tour.users_subscribe_email))
    emails = list(map(lambda user: user.email, subscribe_email))

    subscribe_vk = list(filter(lambda user: user.vk_notifications,
                               tour.users_subscribe_vk))
    vk_uids = list(map(lambda user: user.vk_id, subscribe_vk))

    if emails:
        kwargs = {
            'subject': 'Обновление в новостях турнира MatBoy',
            'recipients': emails,
            'html': render_template('mails/email/new_post.html',
                                    post=post, tour=tour)
        }
        thr_email = Thread(target=send_messages, kwargs=kwargs)
        thr_email.start()

    if vk_uids:
        thr_vk = Thread(target=bot.notification_message,
                        args=[render_template('mails/vk/new_post.vkmsg',
                                              tour=tour), vk_uids])

        thr_vk.start()
    return jsonify({'success': 'ok'})


@blueprint.route('/vk_disintegration', methods=['GET', 'DELETE'])
@login_required
def disintegration():
    if request.method == 'GET':
        return render_template('vk/vk_disintegration.html')
    session = create_session()
    user = session.query(User).get(current_user.id)
    user.vk_id = 0
    user.integration_with_VK = False
    user.vk_notifications = False
    session.commit()
    return jsonify({"success": "ok"})


@blueprint.route('/vk_integration', methods=['GET'])
@login_required
def integration():
    return render_template('vk/vk_integration.html')


@blueprint.route('/vk_integration_notification')
@login_required
def vk_integration_notification():
    """Function for notify user about VK integration"""
    user_id = request.args.get('user_id')
    link = 'https://vk.com/' + request.args.get('screen_name')
    session = create_session()
    user = session.query(User).get(user_id)

    msg = Message(
        subject='Привязка ВКонтакте - MatBoy',
        recipients=[user.email],
        sender=config.MAIL_DEFAULT_SENDER,
        html=render_template('mails/email/vk_notifications.html', link=link, user_id=user_id)
    )
    thr_email = Thread(target=send_message, args=[msg])
    thr_email.start()
    return jsonify({'success': 'ok'})
