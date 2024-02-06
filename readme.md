# Process Tracker

It is a Node.js script that uses PowerShell to track running processes on a system. It reads the output of a PowerShell script, tracks the usage of each process, and writes the tracking information to a JSON file. If a process is no longer running, it logs the expected run time and removes the process from the tracking file.

## Prerequisites

- Node.js
- PowerShell
- ts-node 

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/somyabhattcu1/track-app-usage.git
    ```
2. Navigate to the project directory:
    ```bash
    cd track-app-usage
    ```
3. Install the dependencies:
    ```bash
    npm i
    npm i -g ts-node #recommended
    ```
 ## Usage 
 ```bash
 ts-node src\index.ts #assuming you have ts-node installed globally
 ```