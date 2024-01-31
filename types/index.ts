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
    MainWindowTitle : string,
    ProcessName : string,
    Id : number,
    totalTimes : number,
    initialTime? : number,
    finalTime? : number,
}
