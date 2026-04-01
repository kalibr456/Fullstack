from flask import Blueprint, jsonify, Response
from app.services.weather_service import WeatherService

external_bp = Blueprint('external', __name__)
weather_service = WeatherService()

# --- SEO: robots.txt (Пункт 3.2) ---
@external_bp.route('/robots.txt')
def robots():
    content = "User-agent: *\nDisallow: /diary\nDisallow: /users\nSitemap: http://localhost:5173/sitemap.xml"
    return Response(content, mimetype="text/plain")

# --- SEO: sitemap.xml (Пункт 3.1) ---
@external_bp.route('/sitemap.xml')
def sitemap():
    xml = """<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>http://localhost:5173/</loc><priority>1.0</priority></url>
        <url><loc>http://localhost:5173/about</loc><priority>0.8</priority></url>
    </urlset>"""
    return Response(xml, mimetype="application/xml")

# --- API Погоды (Пункт 5.2) ---
@external_bp.route('/weather')
def get_weather():
    data = weather_service.get_weather()
    if not data:
        return jsonify({"error": "Weather unavailable"}), 503
    return jsonify(data)