# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2017-06-15 23:32


from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('analytics', '0016_merge'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sharedtimetable',
            name='name',
        ),
    ]
