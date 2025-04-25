const leftBox = document.querySelector(".box1");
const rightBox = document.querySelector(".box2");
const inputOne = document.querySelector(".cur-input-1");
const inputTwo = document.querySelector(".cur-input-2");
const leftCurrencyButtons = document.querySelectorAll(".box1 button");
const rightCurrencyButtons = document.querySelectorAll(".box2 button");
const rightRateDisplay = document.getElementById("rightratebox");
const leftRateDisplay = document.getElementById("leftratebox");
const swapButton = document.querySelector(".fa-retweet");

let baseCurrency = "RUB";
let targetCurrency = "USD";

let exchangeRate = null;
const API_TOKEN = `28f165017fa42aa6ccb8c9a4`;

document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector(".currency-list").classList.toggle("show");
});

let isConnected = navigator.onLine;
let lastUpdatedInput = null;
const connectionIndicator = document.getElementById("connection-status");

window.addEventListener("offline", () => {
  isConnected = false;
  connectionIndicator.textContent = "No internet connection";
  connectionIndicator.classList.remove("online");
  connectionIndicator.style.display = "block";
});

window.addEventListener("online", () => {
  isConnected = true;
  connectionIndicator.textContent = "Connected to the internet";
  connectionIndicator.classList.add("online");
  connectionIndicator.style.display = "block";

  setTimeout(() => {
    connectionIndicator.style.display = "none";
  }, 2000);

  if (lastUpdatedInput === "input1") {
    convertInputOne();
  } else if (lastUpdatedInput === "input2") {
    convertInputTwo();
  }
});

const highlightActiveButton = () => {
  leftCurrencyButtons.forEach((button) => {
    if (button.textContent === baseCurrency) {
      button.classList.add("activeButton");
    } else {
      button.classList.remove("activeButton");
    }
  });

  rightCurrencyButtons.forEach((button) => {
    if (button.textContent === targetCurrency) {
      button.classList.add("activeButton");
    } else {
      button.classList.remove("activeButton");
    }
  });
};

const fetchExchangeRate = async (base, target) => {
  if (base === target) {
    leftRateDisplay.textContent = `1 ${base} = 1 ${target}`;
    rightRateDisplay.textContent = `1 ${target} = 1 ${base}`;
    inputTwo.value = inputOne.value;
    return 1;
  }

  const apiEndpoint = `https://v6.exchangerate-api.com/v6/${API_TOKEN}/pair/${baseCurrency}/${targetCurrency}`;

  try {
    const response = await fetch(apiEndpoint);
    const data = await response.json();
    const rate = data["conversion_rate"];
    console.log("Fetched Rate:", rate);
    console.log("Fetched data:", data);

    if (rate) {
      exchangeRate = rate;
      return rate;
    } else {
      console.log("No rate found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching rate:", error);
    return null;
  }
};

const computeConvertedValue = (value, rate) => {
  return value * rate;
};

let isBaseToTarget;

const convertInputOne = async () => {
  isBaseToTarget = true;
  validateInput(inputOne);
  lastUpdatedInput = "input1";

  if (!isConnected) {
    if (baseCurrency === targetCurrency) {
      inputTwo.value = inputOne.value;
    }
    return;
  }

  if (inputOne.value.trim() === "") {
    inputTwo.value = "";
    leftRateDisplay.textContent = "";
    rightRateDisplay.textContent = "";
    return;
  }

  if (baseCurrency === targetCurrency) {
    inputTwo.value = inputOne.value;
    leftRateDisplay.textContent = `1 ${baseCurrency} = 1 ${targetCurrency}`;
    rightRateDisplay.textContent = `1 ${targetCurrency} = 1 ${baseCurrency}`;
    return;
  } else {
    const rate = await fetchExchangeRate(baseCurrency, targetCurrency);
    if (rate !== null) {
      if (isBaseToTarget) {
        const inputValue = parseFloat(inputOne.value) || 0;
        if (!isNaN(inputValue) && exchangeRate !== null) {
          const result = computeConvertedValue(inputValue, rate);
          inputTwo.value = result.toFixed(4);
        }

        const fixedResult = rate.toFixed(5);
        const reversedRate = (1 / rate).toFixed(5);
        leftRateDisplay.textContent = `1 ${baseCurrency} = ${fixedResult} ${targetCurrency}`;
        rightRateDisplay.textContent = `1 ${targetCurrency} = ${reversedRate} ${baseCurrency}`;
      }
    }
  }
};

const convertInputTwo = async () => {
  isBaseToTarget = false;
  validateInput(inputTwo);

  if (inputTwo.value.trim() === "") {
    inputOne.value = "";
    leftRateDisplay.textContent = "";
    rightRateDisplay.textContent = "";
    return;
  }

  if (targetCurrency === baseCurrency) {
    inputOne.value = inputTwo.value;
    leftRateDisplay.textContent = `1 ${baseCurrency} = 1 ${targetCurrency}`;
    rightRateDisplay.textContent = `1 ${targetCurrency} = 1 ${baseCurrency}`;
    return;
  }

  const rate = await fetchExchangeRate(targetCurrency, baseCurrency);
  if (rate !== null) {
    if (!isBaseToTarget) {
      const inputValue = parseFloat(inputTwo.value);
      if (!isNaN(inputValue)) {
        const result = computeConvertedValue(inputValue, rate);
        inputOne.value = result.toFixed(4);
      }

      const fixedResult = rate.toFixed(5);
      const reversedRate = (1 / rate).toFixed(5);
      leftRateDisplay.textContent = `1 ${baseCurrency} = ${reversedRate} ${targetCurrency}`;
      rightRateDisplay.textContent = `1 ${targetCurrency} = ${fixedResult} ${baseCurrency}`;
    }
  }
};

const handleInputChange = (e) => {
  if (e.target === inputOne) {
    isBaseToTarget = true;
    validateInput(inputOne);
    convertInputOne();
  } else if (e.target === inputTwo) {
    isBaseToTarget = false;
    validateInput(inputTwo);
    convertInputTwo();
  }
};

inputOne.addEventListener("input", handleInputChange);
inputTwo.addEventListener("input", handleInputChange);

leftCurrencyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (baseCurrency !== button.textContent) {
      baseCurrency = button.textContent;
      highlightActiveButton();
      if (isBaseToTarget) {
        convertInputOne();
      } else {
        convertInputTwo();
      }
    }
  });
});

rightCurrencyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (targetCurrency !== button.textContent) {
      targetCurrency = button.textContent;
      highlightActiveButton();
      if (!isBaseToTarget) {
        convertInputTwo();
      } else {
        convertInputOne();
      }
    }
  });
});

const validateInput = (input) => {
  let value = input.value;
  value = value.replace(/,/g, ".");

  let hasExponent = false;
  let cleaned = value
    .split("")
    .filter((char, index) => {
      if (char >= "0" && char <= "9") return true;
      if (char === ".") return true;
      if (char === "e") {
        if (hasExponent) return false;
        hasExponent = true;
        return index > 0 && value[index - 1] >= "0" && value[index - 1] <= "9";
      }
      return false;
    })
    .join("");

  if (cleaned.includes(".")) {
    let parts = cleaned.split(".");
    if (parts.length > 2) {
      parts = [parts[0], parts.slice(1).join("")];
    }
    if (parts[1] && parts[1].length > 5) {
      parts[1] = parts[1].slice(0, 5);
    }
    cleaned = parts.join(".");
  }

  if (cleaned === "") {
    input.value = "";
    return;
  }

  if (cleaned === ".") {
    input.value = "0.";
    return;
  }

  if (cleaned === "0") {
    input.value = "0";
    return;
  }

  if (cleaned !== "0" && !cleaned.startsWith("0")) {
    while (cleaned.startsWith("0") && cleaned.length > 1) {
      cleaned = cleaned.slice(1);
    }
  }

  if (cleaned.startsWith("0.") && cleaned.length > 2) {
    input.value = cleaned;
    return;
  }
  if (cleaned.startsWith("0") && !cleaned.startsWith("0.") && cleaned.length > 1) {
    if (cleaned[1] >= "1" && cleaned[1] <= "9") {
      cleaned = "0." + cleaned.slice(1);
    } else {
      cleaned = "0";
    }
  }

  input.value = cleaned;
};

