@echo off
cd %~dp0
python -m waitress --listen=127.0.0.1:5124 river_test:app
pause
