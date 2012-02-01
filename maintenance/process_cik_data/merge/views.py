# coding=utf8
import json
import os.path
import re

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import redirect, render_to_response
from django.template import RequestContext

from merge.utils import DATA_PATH, get_regions_data, merge_data, parse_address

regions_ids_path = os.path.join(DATA_PATH, 'region_ids.txt')

REGIONS = []
for line in open(regions_ids_path):
    region_title, region_name, region_id = line.split(', ')
    REGIONS.append((region_name, region_title, region_id.strip()))

def main(request):
    # TODO: show number of unmerged entries for each region
    left = []
    for name, title, region_id in REGIONS:
        info_data_path = os.path.join(DATA_PATH, 'regions', name+'-info.json')
        left.append((name, title, len(json.loads(open(info_data_path).read().decode('windows-1251')))))

    return render_to_response('main.html', {'REGIONS': left})

def region(request, name):
    region = (filter(lambda region: region[0]==name, REGIONS) or [None])[0]
    if not region:
        return None

    if request.method == 'POST':
        if 'result_tik' not in request.POST:
            return HttpResponse(u'Выбирите округ в левой таблице')
        tvd, root = request.POST['result_tik'].split('_')
        vrnorg, vrnkomis = request.POST['info_tik'].split('_')

        if 'add_geo' in request.POST:
            x_coord, y_coord = float(request.POST['x_coord']), float(request.POST['y_coord'])
        else:
            x_coord, y_coord = None, None
        merge_data(name, tvd, root, vrnorg, vrnkomis, request.POST['new_name'], x_coord, y_coord,
                int(request.POST['postcode']), request.POST['address'])

        return redirect('region', name)

    results_lst = get_regions_data(name, False)

    info_data_path = os.path.join(DATA_PATH, 'regions', name+'-info.json')
    info_tiks = json.loads(open(info_data_path).read().decode('windows-1251'))

    for info_tik in info_tiks:
        info_tik.update(parse_address(info_tik['address']))

    context = {
        'name': region[0],
        'title': region[1],
        'region_id': region[2],
        'result_tiks': results_lst,
        'info_tiks': info_tiks,
        'merged_tiks': get_regions_data(name, True),
    }
    return render_to_response('region.html', context_instance=RequestContext(request, context))
