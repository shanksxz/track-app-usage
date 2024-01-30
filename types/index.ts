export type PowerShellCommandOutput = {
    ProcessType : 'FOREGROUND' | 'BACKGROUND',
    ProcessName : string,
    Id : number,
    MainWindowTitle : string,
    ExecutablePath : string,
    processTime? : number,
    totalTimes? : number
}

export type TrackFile = {
    ProcessType : 'FOREGROUND' | 'BACKGROUND',
    ProcessName : string,
    Id : number,
    totalTimes : number
}
