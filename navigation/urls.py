from django.conf.urls.defaults import patterns, url

def tabbed_static_url(name, template):
    return url(r'^'+name+'$', 'static_page', {'name': name, 'template': template}, name=name)

urlpatterns = patterns('navigation.views',
    url(r'^$', 'main', name='main'),
    url(r'^wall$', 'wall', name='wall'),

    # Static pages
    tabbed_static_url('about', 'static_pages/about/base.html'),
    tabbed_static_url('rules', 'static_pages/about/base.html'),
    tabbed_static_url('comparison', 'static_pages/about/base.html'),
    tabbed_static_url('publications', 'static_pages/about/base.html'),
	tabbed_static_url('videoconf', 'static_pages/about/base.html'),
	
	tabbed_static_url('campaign', 'static_pages/campaign/base.html'),
	tabbed_static_url('pressure', 'static_pages/campaign/base.html'),
	tabbed_static_url('observation', 'static_pages/campaign/base.html'),
	tabbed_static_url('behaviour', 'static_pages/campaign/base.html'),

    tabbed_static_url('news', 'static_pages/development/base.html'),
    tabbed_static_url('functionality', 'static_pages/development/base.html'),

    tabbed_static_url('join_team', 'static_pages/how_to_help/base.html'),
    tabbed_static_url('donate', 'static_pages/how_to_help/base.html'),
    tabbed_static_url('volunteer', 'static_pages/how_to_help/base.html'),
    tabbed_static_url('share', 'static_pages/how_to_help/base.html'),
#    tabbed_static_url('feedback', 'static_pages/how_to_help/base.html'),

    url(r'^partners$', 'static_page', {'name': 'partners', 'template': 'static_pages/partners.html'}, name='partners'),
	url(r'^faq$', 'static_page', {'name': 'faq', 'template': 'static_pages/faq.html'}, name='faq'),

    url(r'^sitemap$', 'sitemap', name='sitemap'),
)
