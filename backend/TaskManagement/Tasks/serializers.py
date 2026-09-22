from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "created_at",
            "updated_at",
            "created_by",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "created_by",
        ]