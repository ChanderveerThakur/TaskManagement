#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python TaskManagement/manage.py collectstatic --no-input
python TaskManagement/manage.py migrate
