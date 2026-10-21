import { Client, GatewayIntentBits } from 'discord.js';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { createServer } from 'node:http';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
});

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    discord: client.isReady() ? 'connected' : 'connecting',
  }));
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

async function appendExpense(description: string, amount: number, date: string, type: string, person: string) {
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:E',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[date, description, amount, type, person]],
    },
  });
}
async function expenseInfo() {
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!C:E',
    valueRenderOption: 'UNFORMATTED_VALUE',
  });
  const rows = response.data.values ?? [];
  const personsExpenses: Map<string, { debit: number; credit: number; }> = new Map();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const [amount, type, person] = row;
    if(amount === 'Amount' && type === 'Type' && person === 'Person') continue;
    if(personsExpenses.has(person)){
      const existing = personsExpenses.get(person)!;
      if(type === 'debit') {
        existing.debit+= amount;
      }
      else if(type === 'credit') {
        existing.credit+= amount;
      }
    }
    else {
      personsExpenses.set(person, { debit: type === 'debit' ? amount : 0, credit: type === 'credit' ? amount : 0 });
    }
  }
  return personsExpenses;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  
  if(msg.content.toLowerCase() === "help") {
    await msg.reply(
    `**Expense Bot Help**

**Log an expense**
Format: \`Type - Description - Amount - Person(s)\`
Type can be \`Debit\`/\`D\` or \`Credit\`/\`C\`.

Examples:
\`Debit - Groceries - 200 - John\`
\`Credit - Dinner contribution - 500 - Alice, Bob\`

For multiple people, separate their names with commas. The amount is split between them.

**View the summary**
Type \`info\` to see each person's credit, debit, balance, and debt, plus the totals.`
  );
    return;
  }
  if(msg.content.toLowerCase() === "info") {
    const personsExpenses = await expenseInfo();
    let replyMessage = '**📊 Expense Summary**\n';
    let totalCredit = 0;
    let totalDebit = 0;
    for (const [person, { debit, credit }] of personsExpenses.entries()) {
      const balance = Math.max(credit - debit, 0);
      const debt = Math.max(debit - credit, 0);

      totalCredit += credit;
      totalDebit += debit;

      replyMessage +=
        `\n**${person.toUpperCase()}**\n` +
        `> 🟢 Credit: ₹${credit}\n` +
        `> 🔴 Debit: ₹${debit}\n` +
        `> 💰 Balance: ₹${balance}\n` +
        `> ⚠️ Debt: ₹${debt}\n`;
    }
    replyMessage += `\n**Total**\n> 🟢 Credit: ₹${totalCredit}\n> 🔴 Debit: ₹${totalDebit}\n> 💰 Balance: ₹${Math.max(totalCredit - totalDebit, 0)}\n> ⚠️ Debt: ₹${Math.max(totalDebit - totalCredit, 0)}\n`;
    msg.reply(replyMessage);
    return;
  }
  const normalized = msg.content.toLowerCase().trim();
  if (normalized === 'hi' || normalized === 'hello') {
    msg.reply('Hello! Please send in format: `Debit/Credit - Description - Amount - Person` e.g., `Debit - Groceries - 200 - John`');
    return;
  }
  const match = normalized.match(/^(d|debit|c|credit)\s*-\s*(.+?)\s*-\s*(\d+(?:\.\d+)?)\s*-\s*([^,]+(?:\s*,\s*[^,]+)*)$/);
  if (!match) {
    msg.reply('Use format: `Debit - description - amount - person, person`');
    return;
  }
  const createdAt = new Date(msg.createdTimestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const [, rawType, rawDescription, amountStr, peopleStr] = match; // leading comma means ignoring the first element of the array match
  const amount = parseFloat(amountStr);
  const type = rawType === 'd' || rawType === 'debit' ? 'debit' : 'credit';
  const description = rawDescription.trim();
  const persons = peopleStr.split(',').map(name=>name.trim());
  try {
    const totalPerson = persons.length;
    const actualAmount = Math.round(amount / totalPerson);
    for(let i = 0; i<totalPerson; i++){
      await appendExpense(description, actualAmount, createdAt, type, persons[i]);
      msg.reply(`✅ Saved: ${persons[i]} - ${description} - ₹${actualAmount}`);
    }
  } catch (err) {
    console.error(err);
    msg.reply('❌ Failed to save expense.');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`HTTP server listening on port ${port}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
