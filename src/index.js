const { prompt, logMessage, rl } = require("./utils/logger");
const ariDaily = require("./class/ariDaily");
const { getRandomProxy, loadProxies } = require("./class/proxy");
const chalk = require("chalk");
const fs = require("fs");
const cron = require("node-cron");

const SETTINGS_FILE = "settings.json";

function loadSettings() {
  if (fs.existsSync(SETTINGS_FILE)) {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
  }
  return { mode: null, manualAnswerIdx: null };
}

function saveSettings(mode, manualAnswerIdx) {
  fs.writeFileSync(
    SETTINGS_FILE,
    JSON.stringify({ mode, manualAnswerIdx }, null, 2)
  );
}

async function runDailyTask() {
  let settings = loadSettings();
  let isManualMode;
  let manualAnswerIdx = null;
  if (!settings.mode) {
    const answerMode = await prompt(
      chalk.yellow(
        "Choose for answer question: (1) Manual, (2) Automate (Random Choices) [1/2]: "
      )
    );
    isManualMode = answerMode === "1";

    if (isManualMode) {
      manualAnswerIdx = await prompt(chalk.yellow("Choose answer (1-4): "));
    }

    saveSettings(isManualMode ? "manual" : "auto", manualAnswerIdx);
  } else {
    isManualMode = settings.mode === "manual";

    if (isManualMode) {
      manualAnswerIdx = await prompt(chalk.yellow("Choose answer (1-4): "));
      saveSettings("manual", manualAnswerIdx);
    } else {
      manualAnswerIdx = settings.manualAnswerIdx;
    }
  }

  let successful = 0;
  const accounts = fs
    .readFileSync("accountsbot.txt", "utf8")
    .split("\n")
    .filter(Boolean);
  const count = accounts.length;
  const proxiesLoaded = loadProxies();

  if (!proxiesLoaded) {
    logMessage(null, null, "No Proxy. Using default IP", "debug");
  }

  try {
    for (let i = 0; i < count; i++) {
      console.log(chalk.white("-".repeat(85)));
      const [email, address] = accounts[i].split(":");
      const currentProxy = await getRandomProxy(i + 1, count);
      const daily = new ariDaily(email, currentProxy, i + 1, count);

      try {
        const result = await daily.singleProses(
          email,
          address,
          isManualMode,
          manualAnswerIdx
        );
        if (result) successful++;
      } catch (error) {
        console.error(`Error processing account ${i + 1}:`, error);
      }
    }
  } finally {
    console.log(chalk.magenta("\n[*] Daily Done bang!"));
    console.log(
      chalk.green(`[*] Account dono ${successful} dari ${count} akun`)
    );
  }
}

async function main() {
  console.log(
    chalk.cyan(`
░█▀█░█▀▄░▀█▀░█▀▀░█░█░█▀█░▀█▀░█▀█
░█▀█░█▀▄░░█░░█░░░█▀█░█▀█░░█░░█░█
░▀░▀░▀░▀░▀▀▀░▀▀▀░▀░▀░▀░▀░▀▀▀░▀░▀
    By : El Puqus Airdrop
    github.com/ahlulmukh
  `)
  );

  await runDailyTask();
  console.log(chalk.yellow("[*] Sleeping until 00:10 UTC..."));
  const now = new Date();
  const targetTime = new Date(now);
  targetTime.setUTCHours(0, 10, 0, 0);
  if (targetTime <= now) {
    targetTime.setUTCDate(targetTime.getUTCDate() + 1);
  }

  const sleepDuration = targetTime - now;

  setTimeout(async () => {
    console.log(chalk.green("\n[*] running bot again..."));
    await runDailyTask();
    cron.schedule("10 0 * * *", async () => {
      console.log(chalk.green("\n[*] Running the task at 00:10 UTC..."));
      await runDailyTask();
    });
  }, sleepDuration);
}

main();
