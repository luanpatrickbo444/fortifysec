@echo off
setlocal
cd /d "%~dp0"
echo [FortifySec] Removendo somente residuos das versoes 13-17...
if exist "app\painel\cursos\layout.tsx" del /f /q "app\painel\cursos\layout.tsx"
if exist "app\painel\ctf\layout.tsx" del /f /q "app\painel\ctf\layout.tsx"
if exist "app\painel\pagamentos\layout.tsx" del /f /q "app\painel\pagamentos\layout.tsx"
if exist "app\painel\perfil\layout.tsx" del /f /q "app\painel\perfil\layout.tsx"
if exist "app\painel\ranking\layout.tsx" del /f /q "app\painel\ranking\layout.tsx"
if exist "components\PanelSectionShell.tsx" del /f /q "components\PanelSectionShell.tsx"
if exist "app\painel\panel.css" del /f /q "app\painel\panel.css"
if exist "scripts\prebuild-ui-guard.mjs" del /f /q "scripts\prebuild-ui-guard.mjs"
if exist ".next" rmdir /s /q ".next"
echo [FortifySec] Limpeza concluida.
echo Verifique: app\painel\layout.tsx deve existir e app\globals.css deve existir.
endlocal
