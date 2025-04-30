# 💸 Discord Expense Tracker Bot

This is a simple Discord bot that allows you to log expenses by sending messages directly in Discord. The bot automatically saves your entries to a connected **Google Sheet**.

## ✨ Features

- Add expenses by messaging the bot like:  
  ```
  Lunch 150
  Groceries 280.50
  ```
- Automatically saves the timestamp, description, and amount into a Google Sheet.
- Built with **TypeScript**, **Google Sheets API**, and **Discord.js**.

---

## 🔐 Environment Variables

You'll need to set up the following variables in a `.env` file at the root of your project:

```env
GOOGLE_SHEET_ID=your_google_sheet_id_here
DISCORD_BOT_TOKEN=your_discord_bot_token_here
GOOGLE_CLIENT_EMAIL=your_service_account_email_here
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

### 📄 How to Get Each One:

#### 1. `GOOGLE_SHEET_ID`
- Open the Google Sheet you want to use.
- Look at the URL:  
  `https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXXXXXXXXXXXXXXX/edit#gid=0`
- Copy the `XXXXXXXXXXXXXXXXXXXXXXXXXXXX` part — that's your `GOOGLE_SHEET_ID`.

#### 2. `DISCORD_BOT_TOKEN`
- Go to [Discord Developer Portal](https://discord.com/developers/applications).
- Create a new application → Go to "Bot" tab → Click "Add Bot".
- Under the "Bot" tab, click "Reset Token" and copy it.
- This is your `DISCORD_BOT_TOKEN`.

#### 3. `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY`
- Go to [Google Cloud Console](https://console.cloud.google.com).
- Enable the **Google Sheets API**.
- Create a **Service Account** under "APIs & Services > Credentials".
- Add a new **JSON key** → download the `.json` file.
- Open the file and copy:
  - `"client_email"` → `GOOGLE_CLIENT_EMAIL`
  - `"private_key"` → `GOOGLE_PRIVATE_KEY`  
    ⚠️ If using `.env`, make sure to wrap the private key in double quotes and preserve line breaks as `\n`, or use `.replace(/\\n/g, '\n')` in your code.

- Finally, **share your Google Sheet** with the `client_email` using "Editor" access.

---

## 🚀 Running the Project

1. Clone this repo:
   ```bash
   git clone https://github.com/your-username/discord-expense-bot.git
   cd discord-expense-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the 4 environment variables as explained above.

4. Run the bot:
   ```bash
   npm run dev
   ```

   Or build and run:
   ```bash
   npm run build
   node dist/index.js
   ```

---

## 📌 Notes

- Make sure the Google Sheet has a tab named `Sheet1` (or change it in your code).
- The bot should be invited to your server with message-reading and message-sending permissions.

---

## 🛠️ Tech Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Discord.js](https://discord.js.org/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs)

---

## 📟 Example Google Sheet Layout

| Timestamp          | Description | Amount |
|--------------------|-------------|--------|
| 2025-04-30 18:34   | Lunch       | 150    |
| 2025-04-30 19:02   | Groceries   | 280.5  |

---

## 📩 Contact

- X (Twitter): [@Er_AliAbbas](https://x.com/Er_AliAbbas)
- Email: aliabbas7317@gmail.com

