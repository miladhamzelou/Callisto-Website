# Generated by Django 2.1 on 2018-08-07 03:09

from django.db import migrations, models
import django.db.models.deletion
import team.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MemberSocialNetwork',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.CharField(max_length=200)),
                ('active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='SocialNetwork',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('icon', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='TeamMember',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('avatar', models.ImageField(upload_to=team.models.upload_avatar)),
                ('name', models.CharField(max_length=100)),
                ('position', models.CharField(max_length=100)),
                ('bio', models.TextField()),
                ('social_network', models.ManyToManyField(through='team.MemberSocialNetwork', to='team.SocialNetwork')),
            ],
        ),
        migrations.AddField(
            model_name='membersocialnetwork',
            name='member',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='team.TeamMember'),
        ),
        migrations.AddField(
            model_name='membersocialnetwork',
            name='network',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='team.SocialNetwork'),
        ),
    ]
