// Adding necessary dependencies
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Google Sheets spreadsheet ID (found in the URL of your spreadsheet)
const SPREADSHEET_ID = ''; // Change this to your spreadsheet ID

// Name of the target sheet within the spreadsheet (ex. 'Sheet1')
const TARGET_SHEET_NAME = ''; // Change this to your target sheet name

// Service account file (ex. 'service_account.json')
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

async function loadSourceData(filePath) {
  const sourceCode = fs.readFileSync(filePath, 'utf8');
  const script = new vm.Script(`source = ${sourceCode}`);
  const context = vm.createContext({});
  script.runInContext(context);
  return context.source;
}

async function clearSheet(authClient, spreadsheetId, sheetName) {
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: sheetName,
    auth: authClient,
  });
}

async function updateSheet(authClient, spreadsheetId, sheetName, data) {
  const resource = { values: data.map(Object.values) };
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: sheetName,
    valueInputOption: 'RAW',
    resource,
    auth: authClient,
  });
}

async function overwriteSheet() {
  try {
    const sourcePath = path.join(__dirname, SOURCE_FILE);
    const sourceData = await loadSourceData(sourcePath);

    if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) {
      throw new Error('Source data is not properly loaded or is empty');
    }

    //Retrieving a sheet which will be modified with source file
    const authClient = await auth.getClient();
    const sheetInfo = await sheets.spreadsheets.get({
      auth: authClient,
      spreadsheetId: SPREADSHEET_ID,
    });
    const sheet = sheetInfo.data.sheets.find(sheet => sheet.properties.title === TARGET_SHEET_NAME);
    if (!sheet) {
      throw new Error(`Sheet with name "${TARGET_SHEET_NAME}" not found`);
    }

    await clearSheet(authClient, SPREADSHEET_ID, TARGET_SHEET_NAME);
    await updateSheet(authClient, SPREADSHEET_ID, TARGET_SHEET_NAME, sourceData);

    console.log('Sheet overwritten successfully');
  } catch (error) {
    console.error('Error overwriting sheet:', error);
  }
}

// Program execution with defined interval
overwriteSheet();
setInterval(overwriteSheet, UPDATE_INTERVAL_MS);
