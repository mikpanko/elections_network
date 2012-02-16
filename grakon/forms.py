# -*- coding:utf-8 -*-
from django import forms
from django.conf import settings
from django.contrib.auth import authenticate
import django.contrib.auth.forms as auth_forms
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.http import int_to_base36

from uni_form.layout import HTML, Layout

from grakon.models import Profile
from grakon.utils import clean_html, form_helper

class LoginForm(auth_forms.AuthenticationForm):
    helper = form_helper('login', u'Войти')
    helper.layout = Layout(HTML(
            r'<input type="hidden" name="next" value="{% if next %}{{ next }}{% else %}{{ request.get_full_path }}{% endif %}" />'))

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        exclude = ('user', 'username')

    helper = form_helper('edit_profile', u'Сохранить')

    def clean_about(self):
        return clean_html(self.cleaned_data['about'])

# TODO: set minimum password complexity
class SetPasswordForm(auth_forms.SetPasswordForm):
    helper = form_helper('', u'Установить пароль')

# TODO: set minimum password complexity
class PasswordChangeForm(auth_forms.PasswordChangeForm):
    helper = form_helper('password_change', u'Сменить пароль')

class PasswordResetForm(auth_forms.PasswordResetForm):
    helper = form_helper('password_reset', u'Восстановить пароль')

    def save(self, **kwargs):
        for user in self.users_cache:
            subject = u'Смена пароля на grakon.org'
            message = render_to_string('auth/password_reset_email.html', {
                'uid': int_to_base36(user.id),
                'user': user,
                'token': kwargs['token_generator'].make_token(user),
                'URL_PREFIX': settings.URL_PREFIX,
            })
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
