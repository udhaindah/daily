const axios = require("axios");
const { logMessage } = require("../utils/logger");
const { getProxyAgent } = require("./proxy");
const qs = require("qs");

class ariDaily {
  constructor(refCode, proxy = null, currentNum, total) {
    this.refCode = refCode;
    this.proxy = proxy;
    this.currentNum = currentNum;
    this.total = total;
    this.axiosConfig = {
      ...(this.proxy && { httpsAgent: getProxyAgent(this.proxy) }),
      timeout: 120000,
    };
  }

  async makeRequest(method, url, config = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios({
          method,
          url,
          ...this.axiosConfig,
          ...config,
        });
        return response;
      } catch (error) {
        logMessage(
          this.currentNum,
          this.total,
          `Request failed: ${error.message}`,
          "error"
        );
        logMessage(
          this.currentNum,
          this.total,
          `Retrying... (${i + 1}/${retries})`,
          "process"
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    return null;
  }

  async checkinDaily(address) {
    logMessage(
      this.currentNum,
      this.total,
      "Proccesing daily checkin...",
      "process"
    );
    const headers = {
      accept: "*/*",
      "content-type": "application/x-www-form-urlencoded",
      host: "arichain.io",
    };
    const data = qs.stringify({ address });
    const response = await this.makeRequest(
      "POST",
      "https://arichain.io/api/event/checkin",
      {
        headers,
        data,
      }
    );
    if (response.data.status === "fail") {
      logMessage(this.currentNum, this.total, response.data.msg, "error");
      return null;
    }
    return response.data.result;
  }

  async getQuestion(address) {
    const headers = {
      accept: "*/*",
      "content-type": "application/x-www-form-urlencoded",
      host: "arichain.io",
    };
    const data = qs.stringify({
      address,
      device: "app",
      blockhain: "testnet",
      is_mobile: "Y",
    });
    const response = await this.makeRequest(
      "POST",
      "https://arichain.io/api/event/quiz_q",
      {
        headers,
        data,
      }
    );

    if (response.data.status === "fail") {
      logMessage(this.currentNum, this.total, response.data.msg, "error");
      return null;
    }

    return response.data.result;
  }

  async answerQuestion(address, answer, quiz_idx) {
    const headers = {
      accept: "*/*",
      "content-type": "application/x-www-form-urlencoded",
      Host: "arichain.io",
    };
    const data = qs.stringify({
      address,
      quiz_idx: quiz_idx,
      answer_idx: answer,
      device: "app",
      blockhain: "testnet",
      is_mobile: "Y",
    });
    const response = await this.makeRequest(
      "POST",
      "https://arichain.io/api/event/quiz_a",
      {
        headers,
        data,
      }
    );

    if (response.data.status === "fail") {
      logMessage(this.currentNum, this.total, response.data.msg, "error");
      return null;
    }

    if (response.data.result.code == 1) {
      logMessage(
        this.currentNum,
        this.total,
        response.data.result.msg,
        "error"
      );
      return null;
    }

    return response.data.result;
  }

  async chooseAnswer(quizData, isManualMode, manualAnswerIdx) {
    const { quiz_idx, quiz_q } = quizData;

    if (isManualMode) {
      const answerIdx = quiz_q[manualAnswerIdx - 1].q_idx;
      logMessage(
        this.currentNum,
        this.total,
        `Using manual answer: ${quiz_q[manualAnswerIdx - 1].question}`,
        "process"
      );
      return { quiz_idx, answerIdx };
    } else {
      const randomIndex = Math.floor(Math.random() * quiz_q.length);
      const answerIdx = quiz_q[randomIndex].q_idx;
      logMessage(
        this.currentNum,
        this.total,
        `Choosing random answer ${quiz_q[randomIndex].question}`,
        "process"
      );
      return { quiz_idx, answerIdx };
    }
  }

  async getDataAccount(email) {
    const headers = {
      accept: "*/*",
      "content-type": "application/x-www-form-urlencoded",
      host: "arichain.io",
    };
    const data = qs.stringify({
      email,
      device: "app",
      blockhain: "testnet",
      is_mobile: "Y",
    });
    const response = await this.makeRequest(
      "POST",
      "https://arichain.io/api/wallet/get_list_mobile",
      {
        headers,
        data,
      }
    );

    if (response.data.status === "fail") {
      logMessage(this.currentNum, this.total, response.data.msg, "error");
      return null;
    }

    return response.data.result;
  }

  async singleProses(email, address, isManualMode, manualAnswerIdx) {
    const dataAccount = await this.getDataAccount(email);
    const coba = dataAccount[0].account;
    if (dataAccount) {
      logMessage(
        this.currentNum,
        this.total,
        `Token account before daily task ${dataAccount[0].balance}`,
        "process"
      );
    }
    const checkin = await this.checkinDaily(coba);
    if (checkin) {
      logMessage(this.currentNum, this.total, "Checkin succesfully", "success");
    }
    const quizData = await this.getQuestion(coba);
    if (!quizData) {
      logMessage(
        this.currentNum,
        this.total,
        "Failed to get question",
        "error"
      );
    }

    const { quiz_idx, answerIdx } = await this.chooseAnswer(
      quizData,
      isManualMode,
      manualAnswerIdx
    );

    const quizResponse = await this.answerQuestion(coba, answerIdx, quiz_idx);
    if (quizResponse) {
      logMessage(
        this.currentNum,
        this.total,
        "Quiz succesfuly answer",
        "success"
      );
    }

    const accountResult = await this.getDataAccount(email);
    if (dataAccount) {
      logMessage(
        this.currentNum,
        this.total,
        `Token account after daily task ${accountResult[0].balance}`,
        "success"
      );
    }

    logMessage(
      this.currentNum,
      this.total,
      "Daily activity completed",
      "success"
    );
    return true;
  }
}

module.exports = ariDaily;
