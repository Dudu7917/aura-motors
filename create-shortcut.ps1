$WshShell = New-Object -ComObject WScript.Shell

$destops = @(
    [Environment]::GetFolderPath('Desktop'),
    "C:\Users\eduar\Desktop"
) | Select-Object -Unique

$workingDir = "c:\Users\eduar\Downloads\aura-motors"
$targetBat = "$workingDir\start-app.bat"

# Localiza o Chrome para o ícone
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)
$chromeExe = $chromePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

# Desbloqueia todos os arquivos da pasta
Get-ChildItem -Path $workingDir -Recurse | Unblock-File -ErrorAction SilentlyContinue

foreach ($d in $destops) {
    if (Test-Path $d) {
        $shortcutPath = Join-Path $d "Aura Motors.lnk"
        
        if (Test-Path $shortcutPath) {
            Remove-Item -Path $shortcutPath -Force -ErrorAction SilentlyContinue
        }

        $shortcut = $WshShell.CreateShortcut($shortcutPath)
        $shortcut.TargetPath = $targetBat
        $shortcut.WorkingDirectory = $workingDir
        $shortcut.Description = "Iniciar Aura Motors no Chrome"
        
        if ($chromeExe) {
            $shortcut.IconLocation = "$chromeExe,0"
        }
        
        $shortcut.WindowStyle = 1 # Normal
        $shortcut.Save()

        Unblock-File -Path $shortcutPath -ErrorAction SilentlyContinue
        Write-Host "Atalho atualizado com sucesso em: $shortcutPath"
    }
}
