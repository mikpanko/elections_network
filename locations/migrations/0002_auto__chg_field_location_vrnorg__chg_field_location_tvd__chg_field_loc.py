# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Changing field 'Location.vrnorg'
        db.alter_column('locations_location', 'vrnorg', self.gf('django.db.models.fields.BigIntegerField')(null=True))

        # Changing field 'Location.tvd'
        db.alter_column('locations_location', 'tvd', self.gf('django.db.models.fields.BigIntegerField')())

        # Changing field 'Location.vrnkomis'
        db.alter_column('locations_location', 'vrnkomis', self.gf('django.db.models.fields.BigIntegerField')(null=True))


    def backwards(self, orm):
        
        # Changing field 'Location.vrnorg'
        db.alter_column('locations_location', 'vrnorg', self.gf('django.db.models.fields.IntegerField')(null=True))

        # Changing field 'Location.tvd'
        db.alter_column('locations_location', 'tvd', self.gf('django.db.models.fields.IntegerField')())

        # Changing field 'Location.vrnkomis'
        db.alter_column('locations_location', 'vrnkomis', self.gf('django.db.models.fields.IntegerField')(null=True))


    models = {
        'locations.location': {
            'Meta': {'object_name': 'Location'},
            'address': ('django.db.models.fields.CharField', [], {'max_length': '200', 'blank': 'True'}),
            'email': ('django.db.models.fields.CharField', [], {'max_length': '40', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '150'}),
            'postcode': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'region': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'in_region'", 'null': 'True', 'to': "orm['locations.Location']"}),
            'region_code': ('django.db.models.fields.IntegerField', [], {}),
            'region_name': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'root': ('django.db.models.fields.IntegerField', [], {}),
            'telephone': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'tik': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'in_tik'", 'null': 'True', 'to': "orm['locations.Location']"}),
            'tvd': ('django.db.models.fields.BigIntegerField', [], {}),
            'vrnkomis': ('django.db.models.fields.BigIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'vrnorg': ('django.db.models.fields.BigIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'x_coord': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'y_coord': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['locations']