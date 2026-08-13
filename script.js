const STORAGE_KEY =
  "taiwanMoneySavingsTrackerV2";


let data =
  JSON.parse(
    localStorage.getItem(STORAGE_KEY)
  ) || {

    salary: 0,

    savingPercent: 40,

    expensePercent: 35,

    familyPercent: 15,

    otherPercent: 10,

    exchangeRate: 1.85,

    goal: 0,

    targetDate: "",

    transactions: [],

    darkMode: true

  };


function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

}


function moneyNT(value) {

  return (
    "NT$" +
    Number(value || 0)
      .toLocaleString(
        "en-US",
        {
          maximumFractionDigits: 2
        }
      )
  );

}


function moneyPHP(value) {

  return (
    "₱" +
    Number(value || 0)
      .toLocaleString(
        "en-US",
        {
          maximumFractionDigits: 2
        }
      )
  );

}


function toPHP(ntAmount) {

  return (
    Number(ntAmount || 0) *
    Number(data.exchangeRate || 0)
  );

}


function getEl(id) {

  return document.getElementById(id);

}



/* ================= CURRENCY ================= */

function saveExchangeRate() {

  const rate =
    Number(
      getEl("exchangeRate").value
    );

  if (rate <= 0) {

    alert(
      "Please enter a valid exchange rate."
    );

    return;
  }

  data.exchangeRate = rate;

  saveData();

  updateCurrency();

  updateDashboard();

  calculateAllocation();

  renderTransactions();

  alert(
    "Exchange rate updated!"
  );

}


function updateCurrency() {

  getEl("exchangeRate").value =
    data.exchangeRate;

  const nt =
    Number(
      getEl("convertNT").value
    ) || 0;

  getEl("convertedPHP").textContent =
    moneyPHP(
      toPHP(nt)
    );

}


getEl("convertNT")
  .addEventListener(
    "input",
    updateCurrency
  );



/* ================= SALARY ================= */

function calculateAllocation() {

  const salary =
    Number(
      getEl("salary").value
    ) || 0;


  const saving =
    Number(
      getEl("savingPercent").value
    ) || 0;


  const expense =
    Number(
      getEl("expensePercent").value
    ) || 0;


  const family =
    Number(
      getEl("familyPercent").value
    ) || 0;


  const other =
    Number(
      getEl("otherPercent").value
    ) || 0;


  const total =
    saving +
    expense +
    family +
    other;


  if (total !== 100) {

    getEl(
      "percentWarning"
    ).classList.remove(
      "hidden"
    );

    return;
  }


  getEl(
    "percentWarning"
  ).classList.add(
    "hidden"
  );


  data.salary = salary;

  data.savingPercent = saving;

  data.expensePercent = expense;

  data.familyPercent = family;

  data.otherPercent = other;


  const savingAmount =
    salary * saving / 100;

  const expenseAmount =
    salary * expense / 100;

  const familyAmount =
    salary * family / 100;

  const otherAmount =
    salary * other / 100;


  getEl(
    "savingAmount"
  ).textContent =
    moneyNT(
      savingAmount
    );

  getEl(
    "savingAmountPHP"
  ).textContent =
    moneyPHP(
      toPHP(
        savingAmount
      )
    );


  getEl(
    "expenseAmount"
  ).textContent =
    moneyNT(
      expenseAmount
    );

  getEl(
    "expenseAmountPHP"
  ).textContent =
    moneyPHP(
      toPHP(
        expenseAmount
      )
    );


  getEl(
    "familyAmount"
  ).textContent =
    moneyNT(
      familyAmount
    );

  getEl(
    "familyAmountPHP"
  ).textContent =
    moneyPHP(
      toPHP(
        familyAmount
      )
    );


  getEl(
    "otherAmount"
  ).textContent =
    moneyNT(
      otherAmount
    );

  getEl(
    "otherAmountPHP"
  ).textContent =
    moneyPHP(
      toPHP(
        otherAmount
      )
    );


  saveData();

  updateDashboard();

}



/* ================= GOAL ================= */

function saveGoal() {

  data.goal =
    Number(
      getEl("goal").value
    ) || 0;


  data.targetDate =
    getEl("targetDate").value;


  saveData();

  updateDashboard();

  alert(
    "Savings goal saved!"
  );

}



/* ================= TRANSACTIONS ================= */

function addTransaction(event) {

  event.preventDefault();


  const date =
    getEl(
      "transactionDate"
    ).value;


  const description =
    getEl(
      "description"
    ).value.trim();


  const category =
    getEl(
      "category"
    ).value;


  const amount =
    Number(
      getEl("amount").value
    );


  if (
    !date ||
    !description ||
    amount <= 0
  ) {

    alert(
      "Please complete all fields."
    );

    return;
  }


  data.transactions.unshift({

    id: Date.now(),

    date: date,

    description: description,

    category: category,

    amount: amount

  });


  saveData();

  getEl(
    "transactionForm"
  ).reset();


  getEl(
    "transactionDate"
  ).value =
    new Date()
      .toISOString()
      .split("T")[0];


  renderTransactions();

  updateDashboard();

}


function deleteTransaction(id) {

  data.transactions =
    data.transactions.filter(
      transaction =>
        transaction.id !== id
    );


  saveData();

  renderTransactions();

  updateDashboard();

}


function clearTransactions() {

  if (
    !confirm(
      "Delete ALL transactions?"
    )
  ) {

    return;
  }


  data.transactions = [];

  saveData();

  renderTransactions();

  updateDashboard();

}



/* ================= TOTALS ================= */

function calculateTotals() {

  let income = 0;

  let savings = 0;

  let expenses = 0;


  data.transactions.forEach(
    transaction => {

      if (
        transaction.category ===
        "income"
      ) {

        income +=
          transaction.amount;

      }


      if (
        transaction.category ===
        "saving"
      ) {

        savings +=
          transaction.amount;

      }


      if (
        transaction.category ===
          "expense" ||

        transaction.category ===
          "family" ||

        transaction.category ===
          "other"
      ) {

        expenses +=
          transaction.amount;

      }

    }
  );


  return {

    income,

    savings,

    expenses,

    remaining:
      income -
      expenses -
      savings

  };

}



/* ================= DASHBOARD ================= */

function updateDashboard() {

  const totals =
    calculateTotals();


  getEl(
    "totalIncome"
  ).textContent =
    moneyNT(
      totals.income
    );


  getEl(
    "totalIncomePHP"
  ).textContent =
    moneyPHP(
      toPHP(
        totals.income
      )
    );


  getEl(
    "totalExpenses"
  ).textContent =
    moneyNT(
      totals.expenses
    );


  getEl(
    "totalExpensesPHP"
  ).textContent =
    moneyPHP(
      toPHP(
        totals.expenses
      )
    );


  getEl(
    "totalSavingsNT"
  ).textContent =
    moneyNT(
      totals.savings
    );


  getEl(
    "totalSavingsPHP"
  ).textContent =
    moneyPHP(
      toPHP(
        totals.savings
      )
    );


  getEl(
    "remaining"
  ).textContent =
    moneyNT(
      totals.remaining
    );


  getEl(
    "remainingPHP"
  ).textContent =
    moneyPHP(
      toPHP(
        totals.remaining
      )
    );


  getEl(
    "goalDisplay"
  ).textContent =
    "Goal: " +
    moneyNT(
      data.goal
    );


  getEl(
    "goalNT"
  ).textContent =
    moneyNT(
      data.goal
    );


  getEl(
    "goalPHP"
  ).textContent =
    moneyPHP(
      toPHP(
        data.goal
      )
    );


  let percent = 0;


  if (
    data.goal > 0
  ) {

    percent =
      (
        totals.savings /
        data.goal
      ) * 100;

  }


  percent =
    Math.min(
      100,
      percent
    );


  getEl(
    "progressBar"
  ).style.width =
    percent + "%";


  getEl(
    "progressText"
  ).textContent =
    percent.toFixed(1) +
    "% of goal";


  const monthlyTarget =
    data.salary *
    data.savingPercent /
    100;


  const yearlyTarget =
    monthlyTarget *
    12;


  getEl(
    "monthlyTarget"
  ).textContent =
    moneyNT(
      monthlyTarget
    );


  getEl(
    "monthlyTargetPHP"
  ).textContent =
    moneyPHP(
      toPHP(
        monthlyTarget
      )
    );


  getEl(
    "yearlyTarget"
  ).textContent =
    moneyNT(
      yearlyTarget
    );


  getEl(
    "yearlyTargetPHP"
  ).textContent =
    moneyPHP(
      toPHP(
        yearlyTarget
      )
    );


  getEl(
    "challengeSaved"
  ).textContent =
    moneyNT(
      totals.savings
    );


  getEl(
    "challengeSavedPHP"
  ).textContent =
    moneyPHP(
      toPHP(
        totals.savings
      )
    );

}



/* ================= TRANSACTION LIST ================= */

function renderTransactions() {

  const list =
    getEl(
      "transactionList"
    );


  list.innerHTML = "";


  if (
    data.transactions.length ===
    0
  ) {

    list.innerHTML = `

      <tr>

        <td colspan="6">

          <span class="muted">

            No transactions yet.

          </span>

        </td>

      </tr>

    `;

    return;
  }


  data.transactions.forEach(
    transaction => {

      const row =
        document.createElement(
          "tr"
        );


      row.innerHTML = `

        <td>
          ${escapeHTML(
            transaction.date
          )}
        </td>

        <td>
          ${escapeHTML(
            transaction.description
          )}
        </td>

        <td>

          <span class="category">

            ${categoryName(
              transaction.category
            )}

          </span>

        </td>

        <td>
          ${moneyNT(
            transaction.amount
          )}
        </td>

        <td>
          ${moneyPHP(
            toPHP(
              transaction.amount
            )
          )}
        </td>

        <td>

          <button

            class="delete-btn"

            onclick="
              deleteTransaction(
                ${transaction.id}
              )
            ">

            ✕

          </button>

        </td>

      `;


      list.appendChild(
        row
      );

    }
  );

}



function categoryName(
  category
) {

  const names = {

    income:
      "💵 Income",

    saving:
      "🏦 Savings",

    expense:
      "🍜 Expense",

    family:
      "🇵🇭 Family",

    other:
      "📦 Others"

  };


  return (
    names[category] ||
    category
  );

}



function escapeHTML(
  value
) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}



/* ================= THEME ================= */

getEl(
  "themeBtn"
)
.addEventListener(
  "click",
  function() {

    data.darkMode =
      !data.darkMode;


    document.body
      .classList.toggle(
        "light",
        !data.darkMode
      );


    this.textContent =
      data.darkMode
        ? "☀️"
        : "🌙";


    saveData();

  }
);



/* ================= BACKUP ================= */

function exportData() {

  const backup =
    JSON.stringify(
      data,
      null,
      2
    );


  const blob =
    new Blob(
      [backup],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href = url;

  link.download =
    "taiwan-money-tracker-backup.json";


  link.click();


  URL.revokeObjectURL(
    url
  );

}



function importData(file) {

  const reader =
    new FileReader();


  reader.onload =
    function(event) {

      try {

        const imported =
          JSON.parse(
            event.target.result
          );


        data = imported;


        saveData();

        loadSettings();

        updateCurrency();

        calculateAllocation();

        renderTransactions();

        updateDashboard();


        alert(
          "Backup imported successfully!"
        );


      } catch {

        alert(
          "Invalid backup file."
        );

      }

    };


  reader.readAsText(
    file
  );

}



getEl(
  "importFile"
)
.addEventListener(
  "change",
  function() {

    if (
      this.files[0]
    ) {

      importData(
        this.files[0]
      );

    }

  }
);



function resetAll() {

  if (
    !confirm(
      "This will delete ALL tracker data. Continue?"
    )
  ) {

    return;
  }


  localStorage.removeItem(
    STORAGE_KEY
  );


  location.reload();

}



/* ================= LOAD ================= */

function loadSettings() {

  getEl(
    "salary"
  ).value =
    data.salary || "";


  getEl(
    "savingPercent"
  ).value =
    data.savingPercent;


  getEl(
    "expensePercent"
  ).value =
    data.expensePercent;


  getEl(
    "familyPercent"
  ).value =
    data.familyPercent;


  getEl(
    "otherPercent"
  ).value =
    data.otherPercent;


  getEl(
    "exchangeRate"
  ).value =
    data.exchangeRate;


  getEl(
    "goal"
  ).value =
    data.goal || "";


  getEl(
    "targetDate"
  ).value =
    data.targetDate || "";


  document.body
    .classList.toggle(
      "light",
      !data.darkMode
    );


  getEl(
    "themeBtn"
  ).textContent =
    data.darkMode
      ? "☀️"
      : "🌙";



  getEl(
    "transactionDate"
  ).value =
    new Date()
      .toISOString()
      .split("T")[0];

}



/* ================= START APP ================= */

loadSettings();

updateCurrency();

renderTransactions();

updateDashboard();

calculateAllocation();
