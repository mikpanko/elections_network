/**
 * ����� ��� ������������� �������
 * 
 * @param {level}
 *            ������� �������������� ������ (�� 1 �� 3)
 * @param {data}
 *            ������ ���� {numVoters: 4, numObservers: 6}
 */
var ElectionCommission = function(id, level, shortTitle, title, address, xCoord, yCoord, data) {
	this.id = id;
	this.level = level < 1 ? 1 : level > 3 ? 3 : level;
	this.shortTitle = shortTitle;
	this.title = title;
	this.address = address;
	this.data = data;
	this.xCoord = xCoord;
	this.yCoord = yCoord;
};

var Grakon = {
	/**
	 * ��� ����� (���������, ���� �� �������� � ������� ������) ��� ��������� ��
	 */
	REGION_STYLES: {
		'default':	new OpenLayers.Style({
					  'fillColor': '#66cccc',
					  'fillOpacity': 0.1,
					  'strokeColor': '#66cccc',
					  'strokeOpacity': 0.25,
					  'strokeWidth': 1
					}),
		'temporary':	new OpenLayers.Style({
						  'fillColor': '#ee9900',
						  'fillOpacity': 0.4,
						  'strokeColor': '#ee9900',
						  'strokeOpacity': 1,
						  'strokeWidth': 2,
						  'cursor': 'pointer'
						}),
		'select':	new OpenLayers.Style({
					  'fillColor': '#0000ff',
					  'fillOpacity': 0.4,
					  'strokeColor': '#0000ff',
					  'strokeOpacity': 1,
					  'strokeWidth': 2
					})
	},
	
	/**
	 * ��� ����� (���������, ���� �� �������� � ������� ������) ��� ������� �������� ��
	 */
	DISTRICT_STYLES: {
		'default':	new OpenLayers.Style({
					  'fillColor': '#66cccc',
					  'fillOpacity': 0.2,
					  'strokeColor': '#000000',
					  'strokeOpacity': 0.75,
					  'strokeWidth': 2,
					  'strokeDashstyle': 'dot'
					}),
		'temporary':	new OpenLayers.Style({
						  'fillColor': '#ee9900',
						  'fillOpacity': 0.4,
						  'strokeColor': '#ee9900',
						  'strokeOpacity': 1,
						  'strokeWidth': 2,
						  'cursor': 'pointer'
						}),
		'select':	new OpenLayers.Style({
					  'fillColor': '#0000ff',
					  'fillOpacity': 0.4,
					  'strokeColor': '#0000ff',
					  'strokeOpacity': 1,
					  'strokeWidth': 2
					})
	},
	
	/**
	 * @private
	 * ������ OpenLayers.Map � ������������ �����.
	 */
	map: null,
	
	/**
	 * �������� ����������� �����.
	 */
	MAP_OPTIONS: {
		projection: new OpenLayers.Projection("EPSG:900913"),
		units: "m",
		numZoomLevels: 18,
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
		maxResolution: 156543.0339,
		maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34),
		controls:[]
	},
	
	MAP_URLS: {
		regions: "/static/oblasts_simplified.json",
		electionCommissionsType2: "/static/election_commissions_level_2.txt",
		electionCommissionsType3: "/static/election_commissions_level_3.txt"
	},
	
	/**
	 * ������� ��������������� �����, � �������� ������������ ����.
	 */
	MAP_LEVELS_ZOOM: new Object({
		'country': 0,
		'regions': 3,
		'districts': 7,
		'areas': 11
	}),
	
	/**
	 * ������� ����, �������������� ������ � �������� ������������� ��������
	 */
	borderLayers: new Object({
		'country': null,
		'regions': null,
		'districts': null,
		'areas': null
	}),
	
	electionCommissionLayers: new Object({
		'country': null,
		'regions': null,
		'districts': null,
		'areas': null
	}),
	
	electionCommissions: new Object(),

	/**
	 * ������������ ��� ��� ��������������� �������
	 */
	Utils: {			
		/**
		 * ���������� ����� �� �������� ��. ���������� ���������� ����� � ���������� �������� ��.
		 * @param {feature} [OpenLayers.Feature] ��������� ������ �� �����
		 */
		regionClickHandler: function(feature) {
			if (feature != null && feature.geometry != null) {
				Grakon.map.zoomToExtent( feature.geometry.getBounds() );
				Grakon.map.zoomIn();
				Grakon.MAP_LEVELS_ZOOM.districts = Grakon.map.getZoom();
			}
		},
		
		districtClickHandler: function(feature) {
			if (feature != null && feature.geometry != null) {
				Grakon.map.zoomToExtent( feature.geometry.getBounds() );
				Grakon.map.zoomIn();
				Grakon.MAP_LEVELS_ZOOM.areas = Grakon.map.getZoom();
			}
		},
		
		/**
		 * callback-�����, ������� ��������� ������ �� GeoJSON,
		 * ������������� � ���� ���������� ������������ ������� �
		 * ��������� �� �� ���� ��������� ��
		 * @private
		 * @param {request} ��������� �� ������ ������������ �������
		 */
		addRegionBorders: function(request) {
			if (request.status == 200) {
				var geoJSON = new OpenLayers.Format.GeoJSON({
					'internalProjection': new OpenLayers.Projection("EPSG:900913"),
					'externalProjection': new OpenLayers.Projection("EPSG:4326")
				});
				var features = geoJSON.read(request.responseText);
				Grakon.borderLayers.regions.addFeatures(features);
			} else
				OpenLayers.Console.error("������ ������ ��������� �� �� ����� GeoJSON ������ ������: " + request.status);
		},
		
		addDistrictBorders: function(request) {
			if (request.status == 200) {
				var geoJSON = new OpenLayers.Format.GeoJSON({
					'internalProjection': new OpenLayers.Projection("EPSG:900913"),
					'externalProjection': new OpenLayers.Projection("EPSG:4326")
				});
				var features = geoJSON.read(request.responseText);
				Grakon.borderLayers.districts.addFeatures(features);
			} else
				OpenLayers.Console.error("������ ������ ������� �������� �� �� ����� GeoJSON ������ ������: " + request.status);
		}
	},
	
	/**
	 * ������ ����� � ���� � ������� � HTML-���������� � �������� ID.
	 * @param {mapDivID} ID HTML-���������� [String]
	 */
	init: function(place) {
		var mapDivID = "publicElectionsMap";
		Grakon.setupLogging();
		Grakon.initMap(mapDivID);
		Grakon.initMapLayers();
		Grakon.initMapTools();
		
		Grakon.setUserLocation();
		Grakon.setDefaultView(place);
	},
	
	/**
     * �������� ��������������� �������������� ������������ �� �����
     */
    setUserLocation: function() {
        // ���������� ���������� ������������ � �������� �� �����
        if (YMaps.location) {
            var size = new OpenLayers.Size(32,32);
			var offset = new OpenLayers.Pixel(-(size.w/2), -(size.h/2));
			var icon = new OpenLayers.Icon('/static/images/user.png', size, offset);
			var userCoords = new OpenLayers.LonLat(YMaps.location.longitude,YMaps.location.latitude).transform(new OpenLayers.Projection("EPSG:4326"), Grakon.map.getProjectionObject());
			var user = new OpenLayers.Marker(userCoords,icon);
			var infoLayer = new OpenLayers.Layer.Markers("Users", {projection: new OpenLayers.Projection("EPSG:4326")});
			infoLayer.addMarker(user);
			Grakon.map.addLayer(infoLayer);
        }
    },
	
	/**
     * ���������� ����� �� ��������� ����� � ����������� ���������.
     * 
     * @param {place} -
     *            �����, ������� ����� �������� �� �����. ���� �� ������, ��
     *            ����� �������� ��� ������
     */
    setDefaultView: function(place) {
        var zoom = Grakon.MAP_LEVELS_ZOOM.regions+1;
        var center = new OpenLayers.LonLat(47.57138, 54.8384).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));

        // ���������� �������� ����� �� �����.
        if (place == null || place == "") { // ���� ����� �� ������, �� ���
                                            // ������������ �� ������ �����
                                            // ���������� ��� �������������� �
                                            // �������� �� ����� � ������������
                                            // ���������;
            // ��� ������������ ��-�� ������ ����� ����� ������������ ��
            // ����������� ����� ������.
            if (YMaps.location && YMaps.location.country == "������") {
                center = new OpenLayers.LonLat(YMaps.location.longitude, YMaps.location.latitude).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
                zoom = YMaps.location.zoom;
            }

            Grakon.map.setCenter(center, zoom);
        } else {
            var geocoder = new YMaps.Geocoder(place, {
                geocodeProvider : "yandex#map"
            });
            // ������� ���������� ��������� ���������� ��������������
            YMaps.Events.observe(geocoder, geocoder.Events.Load, function() {
                // ���� ������ ������, ������������� ����� ����� � ����� �������
                // ������ �������
                    if (this.length()) {
                        var left = this.get(0).getBounds().getLeft();
						var bottom = this.get(0).getBounds().getLeft();
						var right = this.get(0).getBounds().getLeft();
						var top = this.get(0).getBounds().getLeft();
						var bounds = new OpenLayers.Bounds(left, bottom, right, top).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
						Grakon.map.zoomToExtent(bounds);
                    } else
                        Grakon.map.setCenter(center, zoom);
			});

            // ������� �������������� �������� � �������
            YMaps.Events.observe(geocoder, geocoder.Events.Fault, function(gc, error) {
                OpenLayers.Console.error("��������� ������: " + error);
            });
        }
    },
	
	/**
	 * ����� ������ ������ ����� � ��������� �� �������
	 */
	setupLogging: function() {
		OpenLayers.Console = window.console;
		OpenLayers.Console.userError = OpenLayers.Console.error;
	},
	
	/**
	 * ������ ����� � �������� HTML-����������
	 * @param {mapDivID} ID HTML-���������� [String]
	 */
	initMap: function(mapDivID) {
		Grakon.map = new OpenLayers.Map(mapDivID, Grakon.MAP_OPTIONS);
		
		// ������� ������� ��������� ���������������
		Grakon.map.events.register("zoomend", Grakon.map, function() {
			// ������� ��������
			if (Grakon.borderLayers.regions != null)
				Grakon.borderLayers.regions.setVisibility( this.getZoom() < Grakon.MAP_LEVELS_ZOOM.districts );
			
			// ������� �������
			if (Grakon.borderLayers.districts != null)
				Grakon.borderLayers.districts.setVisibility( this.getZoom() >= Grakon.MAP_LEVELS_ZOOM.districts );
				
			// ��������� �����
			if (Grakon.electionCommissionLayers.regions != null)
				Grakon.electionCommissionLayers.regions.setVisibility( this.getZoom() >= Grakon.MAP_LEVELS_ZOOM.regions );
				
			// ��������� �����
			if (Grakon.electionCommissionLayers.districts != null)
				Grakon.electionCommissionLayers.districts.setVisibility( this.getZoom() >= Grakon.MAP_LEVELS_ZOOM.districts );
				
			// ��������� �����
			if (Grakon.electionCommissionLayers.areas != null)
				Grakon.electionCommissionLayers.areas.setVisibility( this.getZoom() >= Grakon.MAP_LEVELS_ZOOM.areas );
		});
		
		// ������� ������� ��������� ����������� �� �����
		Grakon.map.events.register("moveend", Grakon.map, function() {
			if (Grakon.map.getZoom() >= Grakon.MAP_LEVELS_ZOOM.areas) {
				var bounds = Grakon.map.getExtent().transform(Grakon.map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326")).toArray();
				var left = bounds[0];
				var bottom = bounds[1];
				var right = bounds[2];
				var top = bounds[3];
				OpenLayers.loadURL("/location/locations_data",
					{'x1': left,
					'x2': right,
					'y1': bottom,
					'y2': top},
					null,
					function(request) {
						if (request.status == 200) {
							eval(request.responseText);
							if (electionCommissions != null) {
								// ������� ���� ����
								if (Grakon.electionCommissionLayers.areas == null) {
									var areasLayer = new OpenLayers.Layer.Markers( "����" );
									Grakon.electionCommissionLayers.areas = areasLayer;
									Grakon.map.addLayer( areasLayer );
								}
								
								// ������� ����� (�� ����������) ���� �� �����
								for (var uikID in electionCommissions)
									if (Grakon.electionCommissions[uikID] == null) {
										Grakon.electionCommissions[uikID] = electionCommissions[uikID];
										var size = new OpenLayers.Size(18,32);
										var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
										var icon = new OpenLayers.Icon('/static/images/uik.png', size, offset);
										var uikLocation = new OpenLayers.LonLat(electionCommissions[uikID].xCoord,electionCommissions[uikID].yCoord).transform(new OpenLayers.Projection("EPSG:4326"), Grakon.map.getProjectionObject());
										var uik = new OpenLayers.Marker(uikLocation,icon);
										uik.data = electionCommissions[uikID];
										var popup = new OpenLayers.Popup.AnchoredBubble(uik.data.id, uikLocation,
																	 new OpenLayers.Size(300,200),
																	 uik.data.address,
																	 icon, true, null);
										Grakon.map.addPopup(popup);
										popup.hide();
										Grakon.map.events.register('click', uikLocation, function(){popup.show();});
										Grakon.electionCommissionLayers.areas.addMarker(uik);
									}
							}
						} else
							OpenLayers.Console.error("������ ������������� �������� ��� ��������� �������� ������ ������: " + request.status);
					},
					function() {
						OpenLayers.Console.error("������ ��� �������� ������������� �������� ��� ��������� ��������.");
					}
				);
			}
		});
	},
	
	/**
	 * ������ � ��������� ���� �� �����
	 */
	initMapLayers: function() {
		var Y_map = new OpenLayers.Layer.Yandex("�����-����� �� ������",{sphericalMercator: true});
		var Y_sat = new OpenLayers.Layer.Yandex("��� �� �������� �� ������",{type:YMaps.MapType.SATELLITE, sphericalMercator:true});
		var Y_hyb = new OpenLayers.Layer.Yandex("��������� ��� �� ������",{type:YMaps.MapType.HYBRID, sphericalMercator:true});
		var OSM_map = new OpenLayers.Layer.OSM("�����-����� �� OpenStreetMap");
		Grakon.map.addLayer(Y_map);
		Grakon.map.addLayer(OSM_map);
		Grakon.map.addLayer(Y_sat);
		Grakon.map.addLayer(Y_hyb);
		Grakon.map.setBaseLayer(Y_hyb);
		
		Grakon.addRegions();
		Grakon.addDistricts();
		Grakon.addElectionCommissions();
	},
	
	/**
	 * ������� ��������� ���� ��������� �� � ���������� ������ ��� ��������� ���� � �������� ��� �� �����
	 */
	addRegions: function() {			
		var regions = new OpenLayers.Layer.Vector("�������� ��", {
			projection: new OpenLayers.Projection("EPSG:4326"),
			styleMap: new OpenLayers.StyleMap(Grakon.REGION_STYLES)
		});

		// �������� ������� �� ������ ��� ��������� ����
		var highlightCtrl = new OpenLayers.Control.SelectFeature(regions, {
			hover: true,
			highlightOnly: true,
			renderIntent: "temporary"
		});
		Grakon.map.addControl(highlightCtrl);
		highlightCtrl.activate();

		// �������� ������� �� �� ��� ����� ��� ����� �� ��
		var selectCtrl = new OpenLayers.Control.SelectFeature(regions, {
			clickout: true,
			select: Grakon.Utils.regionClickHandler
		});
		Grakon.map.addControl(selectCtrl);
		selectCtrl.activate();

		// �������� ���� �� �����
		Grakon.map.addLayer(regions);
		Grakon.borderLayers.regions = regions;

		// ��������� ������ �� ����
		OpenLayers.loadURL(Grakon.MAP_URLS.regions, {}, Grakon.Utils, Grakon.Utils.addRegionBorders, function() {
			OpenLayers.Console.error("������ ��� �������� ������ ��������� ��");
		});
	},
	
	/**
	 * ������� ��������� ���� ��������� �� � ���������� ������ ��� ��������� ���� � �������� ��� �� �����
	 */
	addElectionCommissions: function() {
		// ��������� ���� �����
		var electionCommissionsLevel3 = new OpenLayers.Layer.Text("����", {
			location: Grakon.MAP_URLS.electionCommissionsType3,
			projection: new OpenLayers.Projection("EPSG:4326")
		});
		electionCommissionsLevel3.setVisibility(false);
		Grakon.map.addLayer(electionCommissionsLevel3);
		Grakon.electionCommissionLayers.districts = electionCommissionsLevel3;
		
		// ��������� ���� �����
		var electionCommissionsLevel2 = new OpenLayers.Layer.Text("����", {
			location: Grakon.MAP_URLS.electionCommissionsType2,
			projection: new OpenLayers.Projection("EPSG:4326")
		});
		Grakon.map.addLayer(electionCommissionsLevel2);
		Grakon.electionCommissionLayers.regions = electionCommissionsLevel2;
	},
	
	addDistricts: function() {			
		var districts = new OpenLayers.Layer.Vector("������", {
			projection: new OpenLayers.Projection("EPSG:4326"),
			styleMap: new OpenLayers.StyleMap(Grakon.DISTRICT_STYLES)
		});
		// �������� ���� �� �����
		districts.setVisibility(false);
		Grakon.borderLayers.districts = districts;
		
		// �������� ������� �� ������ ��� ��������� ����
		var highlightCtrl = new OpenLayers.Control.SelectFeature(districts, {
			hover: true,
			highlightOnly: true,
			renderIntent: "temporary"
		});
		Grakon.map.addControl(highlightCtrl);
		highlightCtrl.activate();

		// �������� ������� �� �� ��� ����� ��� ����� �� ��
		var selectCtrl = new OpenLayers.Control.SelectFeature(districts, {
			clickout: true,
			select: Grakon.Utils.districtClickHandler
		});
		Grakon.map.addControl(selectCtrl);
		selectCtrl.activate();

		// ��������� ������ �� ����
		OpenLayers.loadURL("/static/districts/48s.json", {}, Grakon.Utils, Grakon.Utils.addDistrictBorders, function() {
			OpenLayers.Console.error("������ ��� �������� ������� �������� ��");
		});
		OpenLayers.loadURL("/static/districts/49s.json", {}, Grakon.Utils, Grakon.Utils.addDistrictBorders, function() {
			OpenLayers.Console.error("������ ��� �������� ������� �������� ��");
		});
		
		Grakon.map.addLayer(districts);
	},
	
	/**
	 * ��������� ����������� ���������� �� ����� (��������, ��������������� � ����� ����)
	 */
	initMapTools: function() {
		Grakon.map.addControl(new OpenLayers.Control.PanZoomBar());                  		
		Grakon.map.addControl(new OpenLayers.Control.LayerSwitcher());
		Grakon.map.addControl(new OpenLayers.Control.Navigation());
		Grakon.map.addControl(new OpenLayers.Control.MousePosition());
	}
};
