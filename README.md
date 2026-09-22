Task Management App

A simple full-stack task management application built with React on
the frontend and Django REST Framework on the backend.

The project includes user authentication and task CRUD operations. Each
logged-in user can create and manage their own tasks.

Features

Authentication

User registration

User login

Token-based authentication

User logout

Passwords are securely handled using Django's built-in
authentication system

Task Management

Create a task

View tasks

View a single task

Update a task

Partially update a task

Delete a task

Tasks are associated with the logged-in user

Task status:

Pending

In Progress

Completed

Task priority:

Low

Medium

High

Optional due date

Automatically maintained created_at and updated_at fields

Tech Stack

Frontend

React.js

Axios

React Router

Backend

Python

Django

Django REST Framework

Django Token Authentication

Database

SQLite for local development

Can be configured with PostgreSQL or another Django-supported
database