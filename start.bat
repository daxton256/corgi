@echo off
cd %~dp0
python -m waitress --listen=127.0.0.1:5123 app:app