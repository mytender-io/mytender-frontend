from django.contrib import admin
from django.urls import path
from .views import calculator, guide, home, create_checkout_session, cancel, success, trial_signup, trial_signup_oxygen_finance
from django.views.generic import TemplateView

urlpatterns = [
    path("ITservices", TemplateView.as_view(template_name="ITServices.html"), name='ITservices'),
    path("financialservices", TemplateView.as_view(template_name="financialservices.html"), name='financialservices'),
    path("facilitymanagement", TemplateView.as_view(template_name="facilitymanagement.html"), name='facilitymanagement'),
    path("healthcare", TemplateView.as_view(template_name="healthcare.html"), name='healthcare'),
    path("telecoms", TemplateView.as_view(template_name="telecoms.html"), name='telecoms'),
    path("publicsector", TemplateView.as_view(template_name="publicsector.html"), name='publicsector'),
    path("languageengine", TemplateView.as_view(template_name="languageengine.html"), name='languageengine'),
    path("security", TemplateView.as_view(template_name="security.html"), name='security'),
    path("futureai", TemplateView.as_view(template_name="aiblog.html"), name='futureai'),
    path("story", TemplateView.as_view(template_name="story.html"), name='story'),
    path("intro", TemplateView.as_view(template_name="intro.html"), name='intro'),
    path("about", TemplateView.as_view(template_name="about.html"), name='about'),
    path("pricing", TemplateView.as_view(template_name="enrollmentTesting.html"), name='pricing'),
    path('calculator/', calculator, name='calculator'),
    path('thankyou', TemplateView.as_view(template_name="thankyou.html"), name='thankyou'),
    path('guide/', guide, name='guide'),
    path("", home, name='home'),
    path('cancel/', cancel, name='cancel'),
    path('success/', success, name='success'),
    path('create-checkout-session/', create_checkout_session, name='create-checkout-session'),
    path('terms_and_conditions', TemplateView.as_view(template_name="terms_and_conditions.html"), name='terms_and_conditions'),
    path('data_protection_overview', TemplateView.as_view(template_name="data_protection_overview.html"), name='data_protection_overview'),
    path('bidstats', trial_signup, name='landing_page'),
    path('oxygen-finance', trial_signup_oxygen_finance, name='landing_page_oxygen_finance')
]

