$runningProcesses = Get-Process
$processesData = foreach ($process in $runningProcesses) {
    if (-not [string]::IsNullOrWhiteSpace($process.MainWindowTitle)) {
        [PSCustomObject]@{
            ProcessType = "Foreground"
            ProcessName = $process.ProcessName
            Id = $process.Id
            MainWindowTitle = $process.MainWindowTitle
            ExecutablePath = $process.MainModule.FileName
        }
    } elseif (-not [string]::IsNullOrWhiteSpace($process.WindowTitle)) {
        [PSCustomObject]@{
            ProcessType = "Foreground"
            ProcessName = $process.ProcessName
            Id = $process.Id
            MainWindowTitle = $process.WindowTitle
            ExecutablePath = $process.MainModule.FileName
        }
    }
}

$processesData | ConvertTo-Json
