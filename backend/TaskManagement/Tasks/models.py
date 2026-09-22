from django.db import models
from django.contrib.auth.models import User


class Task(models.Model):

    class Status(models.TextChoices):
        PENDING = "Pending", "Pending"
        IN_PROGRESS = "In Progress", "In Progress"
        COMPLETED = "Completed", "Completed"

    class Priority(models.TextChoices):
        LOW = "Low", "Low"
        MEDIUM = "Medium", "Medium"
        HIGH = "High", "High"

    title = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )

    due_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    def __str__(self):
        return self.title