import { Client, GatewayIntentBits } from 'discord.js';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
});

const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheetId = process.env.GOOGLE_SHEET_ID;
if (!sheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID in environment variables.");
}

async function appendExpense(description: string, amount: number) {
  const sheets = google.sheets({ version: 'v4', auth });
  const date = new Date().toLocaleString();
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:C',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[date, description, amount]],
    },
  });
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  const match = msg.content.match(/^(.+?)\s+(\d+(\.\d+)?)/);
  if (!match) {
    msg.reply('Please send in format: `ItemName Amount` e.g., `Groceries 200`');
    return;
  }

  const [, description, amountStr] = match; // leading comma means ignoring the first element of the array match
  const amount = parseFloat(amountStr);

  try {
    await appendExpense(description, amount);
    msg.reply(`✅ Saved: ${description} - ₹${amount}`);
  } catch (err) {
    console.error(err);
    msg.reply('❌ Failed to save expense.');
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
