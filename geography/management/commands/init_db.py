import json
import os.path
import re

from django.conf import settings
from django.core.management.base import BaseCommand

region_name_re = re.compile(r'(\d{1,3}\s)?(.*)')
def strip_prefix_number(name):
    m = region_name_re.match(name)
    return m.group(2)

def iterate_struct(data, seq):
    for sub_region, sub_data in data['sub'].iteritems():
        sub_region = strip_prefix_number(sub_region)
        yield seq + [sub_region]
        for loc in iterate_struct(sub_data, seq+[sub_region]):
            yield loc

class Command(BaseCommand):
    help = "Loads geography data after first syncdb."

    def handle(self, *args, **options):
        from geography.models import Location

        db_entries = {}

        # TODO: remove numbers in the beginning of the name
        data = json.loads(open(os.path.join(settings.PROJECT_PATH, 'regions.json')).read())
        for location in iterate_struct(data, []):
            if len(location) == 1:
                db_entries[location[0]] = {'entry': Location.objects.create(name=location[0]), 'sub': {}}
            elif len(location) == 2:
                db_entries[location[0]]['sub'][location[1]] = \
                        Location.objects.create(name=location[1], parent_1=db_entries[location[0]]['entry'])
            elif len(location) == 3:
                Location.objects.create(name=location[2], parent_1=db_entries[location[0]]['entry'],
                        parent_2=db_entries[location[0]]['sub'][location[1]])

        print Location.objects.count()
