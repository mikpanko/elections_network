from users.models import Role

class ProfileMiddleware(object):
    def process_request(self, request):
        request.roles = {}
        if request.user.is_authenticated():
            request.profile = request.user.get_profile()

            for role in Role.objects.filter(user=request.profile).select_related('location'):
                request.roles.setdefault(role.type, role)
        else:
            request.profile = None
