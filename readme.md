# Ari Chain Daily Checkin & Answer Quiz

This bot automates to daily checkin and answer quiz

## Features

- Multi Account
- Uses proxies
- Logs accounts.
- Answer daily manually/automatically.

## Requirements

- Node.js v18.20.5 LTS or latest.
- npm (Node Package Manager)

## Installation

1.  Clone the repository:

    ```sh
    git clone https://github.com/ahlulmukh/arichain-daily.git
    cd arichain-daily
    ```

2.  Install the dependencies:

    ```sh
    npm install
    ```

3.  Create a `proxy.txt` file in the root directory and add your proxies (one per line).

    ```sh
    http://user:pass@host:port
    http://user:pass@host:port
    http://user:pass@host:port
    ```

4.  Create a `accountsbot.txt`, format account in below, if you using my bot reff just copy and paste accountsbot.txt to this directory.

    ```sh
    email:address
    email:address
    email:address
    ```

## Usage

1. Run the bot:

   ```sh
   node .
   ```

2. Choose manual answer daily or auto, and done.

3. if you want change answer daily you can change in `setting.json`, `"mode": "auto"` or `"mode": "manual"`,

## Notes

- Make sure to use valid proxies to avoid IP bans.

## Stay Connected

- Channel Telegram : [Telegram](https://t.me/elpuqus)
- Channel WhatsApp : [Whatsapp](https://whatsapp.com/channel/0029VavBRhGBqbrEF9vxal1R)

## Donation

If you would like to support the development of this project, you can make a donation using the following addresses:

- Solana: `FPDcn6KfFrZm3nNwvrwJqq5jzRwqfKbGZ3TxmJNsWrh9`
- EVM: `0xae1920bb53f16df1b8a15fc3544064cc71addd92`
- BTC: `bc1pnzm240jfj3ac9yk579hxcldjjwzcuhcpvd3y3jdph3ats25lrmcsln99qf`

## Disclaimer

This tool is for educational purposes only. Use it at your own risk.
