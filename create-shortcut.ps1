$WshShell = New-Object -ComObject WScript.Shell

$destops = @(
    [Environment]::GetFolderPath('Desktop'),
    "C:\Users\eduar\Desktop"
) | Select-Object -Unique

$targetBat = "c:\Users\eduar\Downloads\aura-motors\start-app.bat"
$workingDir = "c:\Users\eduar\Downloads\aura-motors"

foreach ($d in $destops) {
    if (Test-Path $d) {
        $shortcutPath = Join-Path $d "Aura Motors.lnk"
        $shortcut = $WshShell.CreateShortcut($shortcutPath)
        $shortcut.TargetPath = $targetBat
        $shortcut.WorkingDirectory = $workingDir
        $shortcut.Description = "Iniciar aplicativo Aura Motors"
        $shortcut.IconLocation = "shell32.dll,13"
        $shortcut.Save()
        Write-Host "Atalho criado com sucesso em: $shortcutPath"
    }
}
