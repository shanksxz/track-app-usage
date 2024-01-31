//? this file is just for testing purpose
const { exec } = require('child_process')
const fs = require('fs');

import { promisify } from 'util';

// types
import { ExecException } from "child_process";
import {
    PowerShellCommandOutput,
    TrackFile
} from '../types/index';

// paths
const outputFilePath = './json/output.json';
const trackFilePath = './json/track.json';
const detailsFilePath = './json/details.json';
const psFilePath = './scripts/index.ps1';

console.log("Getting started\n");

 function runPowerShellCommand() {
    exec(`powershell.exe -File ${psFilePath}`, async (err: ExecException, stdout: string, stderr: string) => {

        if (err) {
            throw err;
        }

        const output = JSON.parse(stdout);

        fs.writeFile(outputFilePath, JSON.stringify(output), (err: any) => {
            if (err) {
                console.log(err);
            }
            console.log(`Successfully Written to ${outputFilePath}`);
        });
    });
}


function readOutput() : PowerShellCommandOutput[]{
    try{
        const rawdata = fs.readFileSync(outputFilePath,'utf8');
        if(!rawdata){
            return [];
        }
        const output = JSON.parse(rawdata);
        return output;
    } catch(err){
        console.log("Err in reading output.json",err);
        return [];
    }
}

function readTrackFile() : TrackFile[]{
    try{
        const rawdata = fs.readFileSync(trackFilePath,'utf8');
        if(!rawdata){
            return [];
        }
        const output = JSON.parse(rawdata);
        return output;
    } catch(err){
        console.log("Err in reading track.json",err);
        return [];
    }
}

function readDetailsFile() : TrackFile[]{
    try{
        const rawdata = fs.readFileSync(detailsFilePath,'utf8');
        if(!rawdata){
            return [];
        }
        const output = JSON.parse(rawdata);
        return output;
    } catch(err){
        console.log("Err in reading details.json",err);
        return [];
    }
}


function trackUsage(){
    const currentProcess = readOutput();

    if (!currentProcess){
        throw new Error('Current process not found');
    }

    const trackFile = readTrackFile();
    // console.log("trackFile",trackFile);

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

  
        fs.writeFile(trackFilePath, JSON.stringify(newTrackFile), (err: any) => {
            if (err) {
                console.log("Err in writing into trackFile",err);
            }
            console.log(`Successfully Written Entry in ${trackFilePath}\n`);
        });

        return;
    }

    // check if every process in track.json is running or not
    // if not running then remove the entry from track.json
    // if running then update the entry in track.json
    // ?how do i check for every process in track.json is running or not 
    // ?if not running then remove the entry from track.json for that particular process 
    // check for every process in track.json is running or not and return process which are not running


    const checkForEveryProcess = trackFile.every((ele) => {
        return currentProcess.some((ele2) => {
            return ele.Id === ele2.Id;
        });
    })

    //? check for new process in currentProcess

    const newProcess = currentProcess.filter((ele) => {
        return !trackFile.some((ele2) => {
            return ele.Id === ele2.Id;
        });
    });

    //? track the new process   -- there might be a case where the process is not running but there is an entry in track.json
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

        fs.writeFile(trackFilePath, JSON.stringify([...trackFile, ...newTrackFile]), (err: any) => {
            if (err) {
                console.log("Err in writing into trackFile",err);
            }
            console.log(`Successfully Written Entry in ${trackFilePath}\n`);
        });

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

        fs.writeFile(trackFilePath, JSON.stringify(newTrackFile), (err: any) => {
            if (err) {
                console.log("Err in writing into trackFile",err);
            }
            console.log(`Successfully Written Entry in ${trackFilePath}`);
        });

        return; //? is this return necessary
    }

    //? if every process is not running than remove the entry from track.json
    const newTrackFile = trackFile.filter((ele : TrackFile) => {
        return currentProcess.some((ele2) => {
            return ele.Id === ele2.Id;
        });
    });

    //? console the expected run time for the process which is not running
    const notRunningProcess = trackFile.filter((ele : TrackFile) => {
        return !currentProcess.some((ele2) => {
            return ele.Id === ele2.Id;
        });
    });

    //? reading the details.json
    const detailsFile = readDetailsFile();

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

    //? updating the details.json
    const newDetailsFile = [...detailsFile, ...newNotRunningProcess];


    //? writing the notRunningProcess to details.json
    fs.writeFile(detailsFilePath, JSON.stringify(newDetailsFile), (err: any) => {
        if (err) {
            console.log("Err in writing into detailsFile",err);
        }
        console.log(`Successfully Written Entry in ${detailsFilePath}`);
    });


    notRunningProcess.forEach((ele) => {
        console.log(`Process ${ele.ProcessName} is not running && expected run time is ${ele.totalTimes} seconds\n`);
    });

    //? write to file

    fs.writeFile(trackFilePath, JSON.stringify(newTrackFile), (err: any) => {
        if (err) {
            console.log("Err in updating",err);
        }
        console.log(`Successfully Updated Entry in ${trackFilePath}`);
    });

    return;

    //? is everything handled in above code

    //todo : check if something is missing


    //?rough-start for an single process (chrome)
    // console.log("isChromePresent",isChromePresent)
    // const path = './track.json';

    // const isChromeRunning = currentProcess.some((ele : PowerShellCommandOutput) => {
    //     return ele.ProcessName.toLowerCase() === 'chrome';
    // });

    // console.log("isChromeRunning",isChromeRunning);
    //     if(isChromePresent && isChromeRunning){
    //         let chromeEntry = trackFile.find((ele : TrackFile) => {
    //             return ele.ProcessName.toLowerCase() === 'chrome';
    //         });

    //         console.log("chromeEntry",chromeEntry);
    //         // update the entry in track.json

    //         if(!chromeEntry){
    //             throw new Error('Chrome entry not found');
    //         }

    //         chromeEntry.totalTimes += 1;

    //         // write to file

    //         fs.writeFile(path, JSON.stringify(trackFile), (err: any) => {
    //             if (err) {
    //                 console.log("Err in updating",err);
    //             }
    //             console.log(`Successfully Updated Entry in ${path}`);
    //         });

    //         return;

    //     }

        // if chrome is not running & also there is an entry in track.json
        // console the time and remove the entry from track.json

        // if(isChromePresent && !isChromeRunning){

        //     let chromeEntry = trackFile.find((ele : TrackFile) => {
        //         return ele.ProcessName.toLowerCase() === 'chrome';
        //     });

        //     console.log("chromeEntry",chromeEntry);
        //     // update the entry in track.json

        //     if(!chromeEntry){
        //         throw new Error('Chrome entry not found');
        //     }

        //     console.log(`Chrome is closed && expected run time is ${chromeEntry.totalTimes} seconds`);

        //     // remove the entry from track.json
        //     const newTrackFile = trackFile.filter((ele : TrackFile) => {
        //         return ele.ProcessName.toLowerCase() !== 'chrome';
        //     });

        //     // write to file
        //     fs.writeFile(path, JSON.stringify(newTrackFile), (err: any) => {
        //         if (err) {
        //             console.log("Err in updating",err);
        //         }
        //         console.log(`Successfully Removed Entry in ${path}`);
        //     });

        //     return;
        // }

        // if chrome is running & there is no entry in track.json
        // add the entry in track.json

        // if(!isChromePresent && isChromeRunning){

        //     const chromeEntry : TrackFile = {
        //         ProcessType : 'FOREGROUND',
        //         ProcessName : 'chrome',
        //         Id : currentProcess[0].Id,
        //         totalTimes : 1
        //     }

        //     fs.writeFile(path, JSON.stringify([...trackFile, chromeEntry]), (err: any) => {
        //         if (err) {
        //             console.log("Err in writing into trackFile",err);
        //         }
        //         console.log(`Successfully Written Entry in ${path}`);
        //     });

        //     return;
        // }

        // if chrome is not running & there is no entry in track.json

        // if(!isChromePresent && !isChromeRunning){
        //     return;
        // }

        //?rough-end
}


//? running the powershell command every 1 second (just for testing)

// runPowerShellCommand();

setInterval(() => {
    runPowerShellCommand();
    trackUsage();
}, 5000);
