//? this file is just for testing purpose
const fs = require('fs');
import { promisify } from 'util';
import * as child_process from 'child_process';
import { PowerShellCommandOutput,TrackFile } from '../types/index';


//? paths
const outputFilePath = './json/output.json';
const trackFilePath = './json/track.json';
const detailsFilePath = './json/details.json';
const psFilePath = './scripts/index.ps1';

//? functions
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const exec = promisify(child_process.exec);


 async function runPowerShellCommand() {
    try {
        const { stdout } = await exec(`powershell.exe -File ${psFilePath}`);
        const output = JSON.parse(stdout);
        await writeFile(outputFilePath, JSON.stringify(output));
        console.log(`Successfully Written to ${outputFilePath}`);
    } catch (error) {
        console.error(`Error executing PowerShell command: ${error}`);
    }

}

async function readJsonFile(filePath: string) {
    try {
        const rawdata = await readFile(filePath, 'utf8');
        return JSON.parse(rawdata);
    } catch (err) {
        console.log(`Error reading ${filePath}`, err);
        return [];
    }
}

async function writeJsonFile(filePath: string, data: any) {
    try {
        await writeFile(filePath, JSON.stringify(data));
        console.log(`Successfully written to ${filePath}`);
    } catch (err) {
        console.log(`Error writing to ${filePath}`, err);
    }
}


async function trackUsage(){
    const currentProcess = await readJsonFile(outputFilePath);

    if (!currentProcess){
        throw new Error('Current process not found');
    }

    const trackFile = await readJsonFile(trackFilePath);

    //? if track.json is empty then add the entry in track.json for every process in currentProcess
    if(trackFile.length === 0){
        const newTrackFile = currentProcess.map((ele : PowerShellCommandOutput) => {
            const newTrackFileEntry : TrackFile = {
                ProcessType : ele.ProcessType,
                ProcessName : ele.ProcessName,
                MainWindowTitle : ele.MainWindowTitle,
                Id : ele.Id,
                totalTimes : 1,
                initialTime : new Date().getTime(),
            }
            return newTrackFileEntry;
        });
        await writeJsonFile(trackFilePath, newTrackFile);

        return;
    }

    const checkForEveryProcess = trackFile.every((ele : TrackFile) => {
        return currentProcess.some((ele2 : PowerShellCommandOutput) => {
            return ele.Id === ele2.Id;
        });
    })

    //? check for new process in currentProcess

    const newProcess = currentProcess.filter((ele : PowerShellCommandOutput) => {
        return !trackFile.some((ele2 : TrackFile) => {
            return ele.Id === ele2.Id;
        });
    });

    //? track the new process   -- there might be a case where the process is not      but there is an entry in track.json
    if(newProcess.length > 0){
        const newTrackFile = newProcess.map((ele : PowerShellCommandOutput) => {
            const newTrackFileEntry : TrackFile = {
                ProcessType : ele.ProcessType,
                ProcessName : ele.ProcessName,
                MainWindowTitle : ele.MainWindowTitle,
                Id : ele.Id,
                totalTimes : 1,
                initialTime : new Date().getTime(),
            }
            return newTrackFileEntry;
        });

        await writeJsonFile(trackFilePath, [...trackFile, ...newTrackFile]);

        return;
    }



    //? if every process is running than update the entry in track.json 
    if(checkForEveryProcess){
        const newTrackFile = trackFile.map((ele : TrackFile) => {
            const newTrackFileEntry : TrackFile = {
                ProcessType : ele.ProcessType,
                ProcessName : ele.ProcessName,
                MainWindowTitle : ele.MainWindowTitle,
                Id : ele.Id,
                initialTime : ele.initialTime,
                totalTimes : ele.totalTimes + 5
            }
            return newTrackFileEntry;
        });
        
        console.log("newTrackFile",newTrackFile);
        await writeJsonFile(trackFilePath, newTrackFile);

        return; //? is this return necessary
    }

    //? 



    //? if every process is not running than remove the entry from track.json
    const newTrackFile = trackFile.filter((ele : TrackFile) => {
        return currentProcess.some((ele2 : PowerShellCommandOutput) => {
            return ele.Id === ele2.Id;
        });
    });

    //? console the expected run time for the process which is not running
    const notRunningProcess = trackFile.filter((ele : TrackFile) => {
        return !currentProcess.some((ele2 : PowerShellCommandOutput) => {
            return ele.Id === ele2.Id;
        });
    });

    //? reading the details.json
    const detailsFile = await readJsonFile(detailsFilePath);

    const newNotRunningProcess = notRunningProcess.map((ele : TrackFile) => {
        const newDetailsFileEntry : TrackFile = {
            ProcessType : ele.ProcessType,
            ProcessName : ele.ProcessName,
            MainWindowTitle : ele.MainWindowTitle,
            Id : ele.Id,
            totalTimes : ele.totalTimes,
            initialTime : ele.initialTime,
            finalTime : new Date().getTime(),
        }
        return newDetailsFileEntry;
    });

    const newDetailsFile = [...detailsFile, ...newNotRunningProcess];
    await writeJsonFile(detailsFilePath, newDetailsFile);


    notRunningProcess.forEach((ele : TrackFile) => {
        console.log(`Process ${ele.ProcessName} is not running && expected run time is ${ele.totalTimes} seconds\n`);
    });
    await writeJsonFile(trackFilePath, newTrackFile);
    return;

        //?rough-end
}


function clearFile(filePath: string) {
    fs.writeFileSync(filePath, JSON.stringify([]));
}

process.on('exit', () => {
    clearFile(outputFilePath);
    clearFile(trackFilePath);
    clearFile(detailsFilePath);
});

process.on('SIGINT', () => {
    clearFile(outputFilePath);
    clearFile(trackFilePath);
    clearFile(detailsFilePath);
    process.exit();
});


async function main(){
    try {
        await runPowerShellCommand();
        await trackUsage();
    } catch (err) {
        console.log(err);
    }
    setTimeout(main, 5000);
}

main();