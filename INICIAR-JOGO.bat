@echo off
setlocal
title Fight Turn - Prototipo 2D
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js nao foi encontrado neste computador.
  echo Instale o Node.js e execute este arquivo novamente.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Preparando o jogo pela primeira vez...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo Nao foi possivel preparar o jogo.
    pause
    exit /b 1
  )
)

start "" powershell.exe -NoLogo -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3000/'"

echo.
echo Fight Turn esta iniciando em http://localhost:3000/
echo Para encerrar, pressione Ctrl+C ou feche esta janela.
echo.
call npm run dev -- --host 127.0.0.1 --port 3000 --strictPort

if errorlevel 1 (
  echo.
  echo O jogo nao iniciou. Verifique se outra janela ja esta usando a porta 3000.
  pause
)
