  # JS to Google Sheet parser

This program allows you to parse a JS file with your data and overwrite a specified Google Sheets document at regular intervals.

## Prerequisites

Before you can run this program, ensure you have the following installed and configured on your system:

1. **Node.js**: Download and install the latest version of Node.js from [Node.js official website](https://nodejs.org/).
2. **Visual Studio Code (VS Code)**: Download and install VS Code from [Visual Studio Code official website](https://code.visualstudio.com/).

Additionally, you will need to set up Google APIs:

3. **Google API Setup**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project or select an existing project.
   - Enable the Google Sheets API for your project.
   - Create service account credentials:
     - Navigate to "APIs & Services" > "Credentials".
     - Click "Create Credentials" and select "Service Account".
     - Follow the prompts to create the service account.
     - Download the JSON file with your service account credentials and save it in the root directory of your project. It is highly recommended to rename it something short like 'service_account.json'

## Installation

1. Clone this repository to your local machine or download the source code. Place the program in a folder with your source file and service account file with credentials.

2. Open a terminal and navigate to the project directory.

3. Install the required dependencies by running:
   
   npm install googleapis
