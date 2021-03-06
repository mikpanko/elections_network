from django.db import models

from tinymce.models import HTMLField

class Page(models.Model):
    name = models.CharField(max_length=20)
    content = HTMLField()
    time = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name',)

    def __unicode__(self):
        return self.name
