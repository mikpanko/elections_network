# coding=utf8
import json

from django.contrib import messages, auth
from django.contrib.auth.models import User
from django.shortcuts import redirect, render_to_response
from django.template import RequestContext
from django.template.response import TemplateResponse

from loginza.models import UserMap
from loginza.templatetags.loginza_widget import _return_path

from registration.forms import LoginzaRegistrationForm, RegistrationForm
from registration.models import ActivationProfile
import registration.signals

def register(request):
    if request.user.is_authenticated():
        return redirect('edit_profile')

    if request.method == 'POST':
        form = RegistrationForm(request.POST)

        if form.is_valid():
            user = form.save()
            return redirect('registration_completed')
    else:
        form = RegistrationForm()

    return TemplateResponse(request, 'registration/register.html', {'form': form})

def registration_completed(request):
    if request.user.is_authenticated():
        return redirect('my_profile')
    return TemplateResponse(request, 'registration/registration_completed.html')

def activate(request, activation_key):
    account = ActivationProfile.objects.activate_user(activation_key)
    if account:
        return redirect('activation_completed')
    return TemplateResponse(request, 'registration/activation_fail.html')

def activation_completed(request):
    if request.user.is_authenticated():
        return redirect('my_profile')
    return TemplateResponse(request, 'registration/activation_completed.html')

# TODO: if username and email match an existing account - suggest to link them
# TODO: if there is a need to delete user, registered with loginza - identity must be removed as well
# TODO: what if there are several user maps?
def loginza_register(request):
    if request.user.is_authenticated():
        return redirect('my_profile')

    try:
        identity_id = request.session.get('users_complete_reg_id', None)
        user_map = UserMap.objects.select_related().get(identity__id=identity_id)
    except UserMap.DoesNotExist:
        return redirect('login')

    user_data = json.loads(user_map.identity.data)

    if request.method == 'POST':
        form = LoginzaRegistrationForm(request.POST, user_map=user_map)
        if form.is_valid():
            user = form.save()

            # check if email if provided by loginza - no need to verify it then
            if user_data.get('email') == user.email: # no need to confirm email
                user = auth.authenticate(username=user.username, password=form.cleaned_data['password1'])
                assert user and user.is_authenticated()
                auth.login(request, user)

                #messages.info(request, u'Добро пожаловать!')
                del request.session['users_complete_reg_id']
                return redirect(_return_path(request))
            else:
                return redirect('registration_completed')
    else:
        form = LoginzaRegistrationForm(user_map=user_map, initial={
                'username': user_map.user.username,
                'email': user_map.user.email,
        })

    form.initial['first_name'] = user_data['name']['first_name']
    form.initial['last_name'] = user_data['name']['last_name']

    return render_to_response('registration/loginza_register.html', {'form': form},
            context_instance=RequestContext(request))
