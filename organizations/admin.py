from django.contrib import admin

from organizations.models import Organization, OrganizationCoverage, OrganizationRepresentative

#class OrganizationCoverageInline(admin.TabularInline):
#    model = OrganizationCoverage
#    fk_name = 'organization'
#    extra = 1

#class OrganizationRepresentativeInline(admin.TabularInline):
#    model = OrganizationRepresentative
#    fk_name = 'organization'
#    extra = 1

class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'verified')
    ordering = ('title',)
    search_fields = ('title', 'name', 'address')
    #inlines = [OrganizationCoverageInline, OrganizationRepresentativeInline]

class OrganizationCoverageAdmin(admin.ModelAdmin):
    list_display = ('organization', 'location')
    ordering = ('organization', 'location')
    search_fields = ('organization__title', 'location__name')
    raw_id_fields = ('location',)

class OrganizationRepresentativeAdmin(admin.ModelAdmin):
    list_display = ('organization', 'user')
    ordering = ('organization', 'user__username')
    search_fields = ('organization__title', 'user__username')
    raw_id_fields = ('user',)

admin.site.register(Organization, OrganizationAdmin)
admin.site.register(OrganizationCoverage, OrganizationCoverageAdmin)
admin.site.register(OrganizationRepresentative, OrganizationRepresentativeAdmin)
