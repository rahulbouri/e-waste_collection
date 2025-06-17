# Social Venture Web Application

## Project Overview

This is a Python-based web application skeleton that provides:

- A static homepage with in-page navigation (anchor links).
- A login page that authenticates users via OTP sent to their email.
- New-user onboarding through a Google Form to collect additional details.
- Post-form submission API calls to integrate with downstream services.
- Deployment instructions for hosting the final site.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Setup and Installation](#setup-and-installation)
4. [Frontend Development](#frontend-development)
5. [Backend Development](#backend-development)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [References & Links](#references--links)

---

## Prerequisites

- Python 3.10+ installed on your system
- pip (Python package manager)
- conda (for environment management)
- A service for sending emails (e.g., SendGrid, Gmail SMTP)
- Google account to create Forms
- A hosting provider (e.g., Heroku, AWS, PythonAnywhere)

---

## Project Structure

```bash
project-root/
├── app/                     # Python application package
│   ├── templates/           # HTML templates
│   │   ├── index.html       # Homepage
│   │   └── login.html       # Login page
│   ├── static/
│   │   └── css/
│   │       └── styles.css   # CSS for entire site
│   ├── __init__.py          # Flask app factory
│   ├── routes.py            # URL routes and logic
│   ├── models.py            # Database models
│   └── utils/               # Helper modules
│       ├── otp.py           # OTP generation & verification
│       └── emailer.py       # Email-sending functions
├── .env                     # Environment variables (gitignored)
├── requirements.txt         # Python dependencies
├── README.md                # This documentation
└── Procfile                 # (For Heroku deployment)
```

---

## Setup and Installation

1. **Create and activate conda environment**

   ```bash
   conda create -n social python=3.10 -y
   conda activate social
   ```

2. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**

   - Copy `.envexample` to `.env`:
     ```bash
     cp .envexample .env
     ```
   - Set the following variables in `.env`:
     ```dotenv
     FLASK_APP=app
     FLASK_ENV=development
     SECRET_KEY=<your-secret-key>
     DATABASE_URL=sqlite:///site.db
     EMAIL_HOST=smtp.sendgrid.net
     EMAIL_PORT=587
     EMAIL_USER=apikey         # for SendGrid
     EMAIL_PASS=<your-sendgrid-api-key>
     GOOGLE_FORM_URL=<your-google-form-public-url>
     ```

4. **Initialize the Database**

   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

---

## Frontend Development

- **Homepage with Anchor Links**: See `app/templates/index.html` for a sample navigation bar and sections. Use `<nav>` and anchor tags to jump within the page.
- **Login Page UI**: See `app/templates/login.html` for a simple email input and "Send OTP" button.
- **CSS**: All styles in `app/static/css/styles.css`.

---

## Backend Development

- **Flask** is used as the web framework.
- **Database**: SQLAlchemy models in `app/models.py`.
- **OTP Workflow**: OTP generation in `app/utils/otp.py`, email sending in `app/utils/emailer.py`.
- **Google Form Integration**: Redirect new users to a Google Form. Webhook endpoint at `/api/form-submit`.
- **API Stubs**: Placeholder endpoints in `app/routes.py` for future integrations.

---

## Testing

- Use `pytest` for unit tests.
- Test OTP, email sending (mock), Google Form webhook, and anchor navigation.

---

## Deployment

1. **Choose Hosting Provider** (Heroku, PythonAnywhere, etc.)
2. **Procfile** for Heroku:
   ```Procfile
   web: gunicorn app:app
   ```
3. **Set Config Vars** on hosting dashboard using same ENV keys as `.env`.
4. **Push to Remote**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push heroku main
   ```
5. **Run Migrations in Production**
   ```bash
   heroku run flask db upgrade
   ```
6. **Configure Domain & HTTPS**

---

## References & Links

- [Flask Official Documentation](https://flask.palletsprojects.com/)
- [SendGrid Email API](https://docs.sendgrid.com/)
- [Google Forms Apps Script Webhooks](https://developers.google.com/apps-script)
- [HTML Anchor Links](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a)

---

*This README provides a high-level overview and step-by-step instructions for setting up, developing, and deploying your web application. Update the placeholders and sections as you build out your project.* 