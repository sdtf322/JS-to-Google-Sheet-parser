// Adding necessary dependencies
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Google Sheets spreadsheet ID (found in the URL of your spreadsheet)
const SPREADSHEET_ID = ''; // Change this to your spreadsheet ID

// Name of the target sheet within the spreadsheet (ex. Sheet1)
const TARGET_SHEET_NAME = ''; // Change this to your target sheet name

// Service account file (ex. 'client_secret.json')
const SERVICE_ACCOUNT_NAME = '' // Change this to service account json file

// Source file which will be used to update Google Sheet (ex. 'source.js')
const SOURCE_FILE = '' // Change this to your source file

// Update interval in milliseconds
const UPDATE_INTERVAL_MS = 120000;

// Get a Google Sheets instance 
const SERVICE_ACCOUNT_FILE = path.join(__dirname, SERVICE_ACCOUNT_NAME);
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function overwriteSheet() {
  try {
    // Dynamically load and parse source file to get the latest data which we will use to update sheet
    const sourcePath = path.join(__dirname, SOURCE_FILE);
    const sourceCode = fs.readFileSync(sourcePath, 'utf8');
    const script = new vm.Script(`source = ${sourceCode}`);
    const context = vm.createContext({});
    script.runInContext(context);
    const sourceData = context.source;

    if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) {
      throw new Error('Source data is not properly loaded or is empty');
    }

    // Get authenticated client
    const authClient = await auth.getClient();

    // Get metadata about the spreadsheet and find required sheet to edit
    const sheetInfo = await sheets.spreadsheets.get({
      auth: authClient,
      spreadsheetId: SPREADSHEET_ID,
    });
    const sheet = sheetInfo.data.sheets.find(sheet => sheet.properties.title === TARGET_SHEET_NAME);
    if (!sheet) {
      throw new Error(`Sheet with name "${TARGET_SHEET_NAME}" not found`);
    }
    // Prepare the data which will be used to update sheet
    const resource = { values: sourceData.map(Object.values) };

    const range = `${TARGET_SHEET_NAME}!A1`;

    // Clear the sheet
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TARGET_SHEET_NAME}`,
      auth: authClient,
    });

    // Update the sheet with new data
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      resource: resource,
      auth: authClient,
    });

    console.log('Sheet overwritten successfully');
  } catch (error) {
    console.error('Error overwriting sheet:', error);
  }
}

// Program execution with defined interval
overwriteSheet();
setInterval(overwriteSheet, UPDATE_INTERVAL_MS);
