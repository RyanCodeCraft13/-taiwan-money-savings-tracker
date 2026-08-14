/* =====================================================
   TAIWAN IPON TRACKER V3
   ===================================================== */

const STORAGE_KEY =
  "taiwanIponTrackerV3";


let data =
  JSON.parse(
    localStorage.getItem(STORAGE_KEY)
  ) || {

    exchangeRate: 1.85,

    salary: 0,

    savePercent: 40,

    expensePercent: 35,

    familyPercent: 15,

    otherPercent: 10,

    goalName:
      "My Taiwan Savings",

    goal: 150000,

    goalDate: "",

    transactions: [],

    dark: false

  };


/* =====================================================
   HELPERS
   ===================================================== */

function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

}


function nt(value) {

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


function php(value) {

  return (
    "₱" +
    Number(
      (value || 0) *
      data.exchangeRate
    )
      .toLocaleString(
        "en-US",
        {
          maximumFractionDigits: 2
        }
      )
  );

}


function el(id) {

  return document.getElementById(id);

}


function today() {

  return new Date()
    .toISOString()
    .split("T")[0];

}


function showToast(message) {

  const toast =
    el("toast");

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

  }, 2200);

}


function escapeHTML(value) {

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



/* =====================================================
   NAVIGATION
   ===================================================== */

function showPage(
  page,
  button
) {

  document
    .querySelectorAll(".page")
    .forEach(
      section =>
        section.classList.remove(
          "active"
        )
    );


  const target =
    el(page);

  if (target) {

    target.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(".nav-item")
    .forEach(
      item =>
        item.classList.remove(
          "active"
        )
    );


  if (button) {

    button.classList.add(
      "active"
    );

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}



/* =====================================================
   TRANSACTION MODAL
   ===================================================== */

function openTransaction(
  type = "expense"
) {

  el(
    "transactionType"
  ).value = type;


  el(
    "transactionAmount"
  ).value = "";


  el(
    "transactionDescription"
  ).value = "";


  el(
    "transactionDate"
  ).value =
    today();


  el(
    "transactionModal"
  ).classList.add(
    "show"
  );


  setTimeout(() => {

    el(
      "transactionAmount"
    ).focus();

  }, 200);

}


function closeTransaction() {

  el(
    "transactionModal"
  ).classList.remove(
    "show"
  );

}



/* =====================================================
   ADD TRANSACTION
   ===================================================== */

el(
  "transactionForm"
)
.addEventListener(
  "submit",
  function(event) {

    event.preventDefault();


    const type =
      el(
        "transactionType"
      ).value;


    const amount =
      Number(
        el(
          "transactionAmount"
        ).value
      );


    const description =
      el(
        "transactionDescription"
      )
      .value
      .trim();


    const date =
      el(
        "transactionDate"
      ).value;


    if (
      amount <= 0 ||
      !description ||
      !date
    ) {

      alert(
        "Please complete all fields."
      );

      return;

    }


    data.transactions.unshift({

      id:
        Date.now(),

      type:
        type,

      amount:
        amount,

      description:
        description,

      date:
        date

    });


    saveData();

    closeTransaction();

    renderTransactions();

    updateAll();

    showToast(
      "Transaction added! ✅"
    );

  }
);



/* =====================================================
   TOTALS
   ===================================================== */

function getTotals() {

  let income = 0;

  let savings = 0;

  let expenses = 0;


  data.transactions
    .forEach(
      transaction => {

        if (
          transaction.type ===
          "income"
        ) {

          income +=
            transaction.amount;

        }


        if (
          transaction.type ===
          "saving"
        ) {

          savings +=
            transaction.amount;

        }


        if (
          [
            "expense",
            "family",
            "other"
          ]
          .includes(
            transaction.type
          )
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
      savings -
      expenses

  };

}



/* =====================================================
   HOME
   ===================================================== */

function updateHome() {

  const totals =
    getTotals();


  el(
    "homeSavingsNT"
  ).textContent =
    nt(
      totals.savings
    );


  el(
    "homeSavingsPHP"
  ).textContent =
    php(
      totals.savings
    );


  el(
    "homeIncome"
  ).textContent =
    nt(
      totals.income
    );


  el(
    "homeIncomePHP"
  ).textContent =
    php(
      totals.income
    );


  el(
    "homeExpenses"
  ).textContent =
    nt(
      totals.expenses
    );


  el(
    "homeExpensesPHP"
  ).textContent =
    php(
      totals.expenses
    );


  const month =
    new Date()
      .toISOString()
      .slice(0, 7);


  const monthlySavings =
    data.transactions

      .filter(
        t =>
          t.type ===
            "saving" &&
          t.date.startsWith(
            month
          )
      )

      .reduce(
        (sum, t) =>
          sum + t.amount,
        0
      );


  el(
    "homeMonthSaving"
  ).textContent =
    nt(
      monthlySavings
    );


  el(
    "homeMonthSavingPHP"
  ).textContent =
    php(
      monthlySavings
    );


  const percent =
    data.goal > 0
      ? Math.min(
          100,
          (
            totals.savings /
            data.goal
          ) * 100
        )
      : 0;


  el(
    "homeProgress"
  ).style.width =
    percent + "%";


  el(
    "homeGoalPercent"
  ).textContent =
    percent.toFixed(0) +
    "%";


  el(
    "homeSavedSmall"
  ).textContent =
    nt(
      totals.savings
    );


  el(
    "homeGoalSmall"
  ).textContent =
    nt(
      data.goal
    );


  el(
    "topRate"
  ).textContent =
    Number(
      data.exchangeRate
    ).toFixed(4);


  let message =
    "Start your savings journey today!";


  if (
    percent >= 100
  ) {

    message =
      "Amazing! You reached your goal! 🎉";

  } else if (
    percent >= 75
  ) {

    message =
      "Almost there! Keep saving! 🔥";

  } else if (
    percent >= 50
  ) {

    message =
      "Halfway there! Don't stop now! 💪";

  } else if (
    percent >= 25
  ) {

    message =
      "Great start! Keep building your ipon! 🌱";

  }


  el(
    "challengeMessage"
  ).textContent =
    message;

}



/* =====================================================
   GOAL
   ===================================================== */

function updateGoal() {

  const totals =
    getTotals();


  const percent =
    data.goal > 0
      ? Math.min(
          100,
          (
            totals.savings /
            data.goal
          ) * 100
        )
      : 0;


  el(
    "goalCirclePercent"
  ).textContent =
    percent.toFixed(0) +
    "%";


  const degrees =
    percent * 3.6;


  el(
    "goalCircle"
  );


  const circle =
    document.querySelector(
      ".goal-circle"
    );


  if (circle) {

    circle.style.background =
      `conic-gradient(
        #22c55e ${degrees}deg,
        rgba(255,255,255,.15)
        ${degrees}deg
      )`;

  }


  el(
    "goalTitle"
  ).textContent =
    data.goalName ||
    "My Taiwan Savings";


  el(
    "goalAmount"
  ).textContent =
    nt(
      data.goal
    );


  el(
    "goalPHP"
  ).textContent =
    php(
      data.goal
    );

}



/* =====================================================
   SAVE GOAL
   ===================================================== */

function saveGoal() {

  const name =
    el(
      "goalName"
    ).value.trim();


  const amount =
    Number(
      el(
        "goalInput"
      ).value
    );


  const date =
    el(
      "goalDate"
    ).value;


  if (
    amount <= 0
  ) {

    alert(
      "Please enter a valid goal amount."
    );

    return;

  }


  data.goalName =
    name ||
    "My Taiwan Savings";


  data.goal =
    amount;


  data.goalDate =
    date;


  saveData();

  updateGoal();

  updateHome();

  showToast(
    "Savings goal saved! 🎯"
  );

}



/* =====================================================
   SALARY
   ===================================================== */

function updateSalary() {

  const salary =
    Number(
      el(
        "salaryInput"
      ).value
    ) || 0;


  data.salary =
    salary;


  el(
    "salaryPHP"
  ).textContent =
    php(
      salary
    );


  const save =
    Number(
      el(
        "savePercent"
      ).value
    );


  const expense =
    Number(
      el(
        "expensePercent"
      ).value
    );


  const family =
    Number(
      el(
        "familyPercent"
      ).value
    );


  const other =
    Number(
      el(
        "otherPercent"
      ).value
    );


  const total =
    save +
    expense +
    family +
    other;


  el(
    "allocationTotal"
  ).textContent =
    total + "%";


  el(
    "savePercentText"
  ).textContent =
    save + "%";


  el(
    "expensePercentText"
  ).textContent =
    expense + "%";


  el(
    "familyPercentText"
  ).textContent =
    family + "%";


  el(
    "otherPercentText"
  ).textContent =
    other + "%";


  el(
    "saveAmount"
  ).textContent =
    nt(
      salary *
      save / 100
    );


  el(
    "expenseAmount"
  ).textContent =
    nt(
      salary *
      expense / 100
    );


  el(
    "familyAmount"
  ).textContent =
    nt(
      salary *
      family / 100
    );


  el(
    "otherAmount"
  ).textContent =
    nt(
      salary *
      other / 100
    );


  if (
    total === 100
  ) {

    el(
      "allocationWarning"
    )
    .classList.add(
      "hidden"
    );

  } else {

    el(
      "allocationWarning"
    )
    .classList.remove(
      "hidden"
    );

  }


  data.savePercent =
    save;

  data.expensePercent =
    expense;

  data.familyPercent =
    family;

  data.otherPercent =
    other;


  saveData();

}


[
  "salaryInput",
  "savePercent",
  "expensePercent",
  "familyPercent",
  "otherPercent"
]
.forEach(
  id => {

    el(id)
      .addEventListener(
        "input",
        updateSalary
      );

  }
);



/* =====================================================
   TRANSACTIONS LIST
   ===================================================== */

let currentFilter =
  "all";


function filterTransactions(
  filter,
  button
) {

  currentFilter =
    filter;


  document
    .querySelectorAll(
      ".filter"
    )
    .forEach(
      item =>
        item.classList.remove(
          "active"
        )
    );


  if (button) {

    button.classList.add(
      "active"
    );

  }


  renderTransactions();

}


function getTransactionIcon(
  type
) {

  const icons = {

    income: "💵",

    saving: "🏦",

    expense: "🍜",

    family: "🇵🇭",

    other: "📦"

  };


  return (
    icons[type] ||
    "💰"
  );

}


function getTransactionName(
  type
) {

  const names = {

    income: "Income",

    saving: "Savings",

    expense: "Expense",

    family: "Family / PH",

    other: "Others"

  };


  return (
    names[type] ||
    type
  );

}


function renderTransactions() {

  const container =
    el(
      "transactionList"
    );


  let transactions =
    data.transactions;


  if (
    currentFilter !==
    "all"
  ) {

    transactions =
      transactions.filter(
        t =>
          t.type ===
          currentFilter
      );

  }


  if (
    transactions.length ===
    0
  ) {

    container.innerHTML = `

      <div class="friendly-card">

        <div class="friendly-icon">
          📭
        </div>

        <div class="friendly-content">

          <h3>
            No transactions yet
          </h3>

          <p>
            Add your first transaction
            to start tracking.
          </p>

        </div>

      </div>

    `;

    return;

  }


  container.innerHTML =
    transactions
      .map(
        transaction => {

          const positive =
            [
              "income",
              "saving"
            ]
            .includes(
              transaction.type
            );


          return `

            <div class="transaction">

              <div class="transaction-icon">

                ${getTransactionIcon(
                  transaction.type
                )}

              </div>


              <div class="transaction-info">

                <strong>

                  ${escapeHTML(
                    transaction.description
                  )}

                </strong>

                <small>

                  ${escapeHTML(
                    transaction.date
                  )}
                  •
                  ${getTransactionName(
                    transaction.type
                  )}

                </small>

              </div>


              <div class="transaction-money">

                <strong
                  class="${
                    positive
                      ? "positive"
                      : "negative"
                  }">

                  ${
                    positive
                      ? "+"
                      : "-"
                  }
                  ${nt(
                    transaction.amount
                  )}

                </strong>

                <small>

                  ${php(
                    transaction.amount
                  )}

                </small>

              </div>


              <button
                class="delete-transaction"
                onclick="
                  deleteTransaction(
                    ${transaction.id}
                  )
                ">

                ✕

              </button>

            </div>

          `;

        }
      )
      .join("");

}


function deleteTransaction(
  id
) {

  if (
    !confirm(
      "Delete this transaction?"
    )
  ) {

    return;

  }


  data.transactions =
    data.transactions.filter(
      transaction =>
        transaction.id !== id
    );


  saveData();

  renderTransactions();

  updateAll();

  showToast(
    "Transaction deleted."
  );

}



/* =====================================================
   RATE
   ===================================================== */

function saveRate() {

  const rate =
    Number(
      el(
        "rateInput"
      ).value
    );


  if (
    rate <= 0
  ) {

    alert(
      "Please enter a valid exchange rate."
    );

    return;

  }


  data.exchangeRate =
    rate;


  saveData();

  updateAll();

  showToast(
    "Exchange rate updated! 💱"
  );

}



/* =====================================================
   BACKUP
   ===================================================== */

function exportData() {

  const json =
    JSON.stringify(
      data,
      null,
      2
    );


  const blob =
    new Blob(
      [json],
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


  link.href =
    url;


  link.download =
    "taiwan-ipon-backup.json";


  link.click();


  URL.revokeObjectURL(
    url
  );


  showToast(
    "Backup exported! 📤"
  );

}


el(
  "importFile"
)
.addEventListener(
  "change",
  function() {

    const file =
      this.files[0];


    if (!file) {

      return;

    }


    const reader =
      new FileReader();


    reader.onload =
      function(event) {

        try {

          const imported =
            JSON.parse(
              event.target.result
            );


          if (
            !imported ||
            !Array.isArray(
              imported.transactions
            )
          ) {

            throw new Error(
              "Invalid"
            );

          }


          data =
            imported;


          saveData();

          loadSettings();

          updateAll();

          renderTransactions();


          showToast(
            "Backup restored! 📥"
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
);



/* =====================================================
   RESET
   ===================================================== */

function resetApp() {

  const answer =
    confirm(
      "Are you sure you want to delete ALL your tracker data?"
    );


  if (!answer) {

    return;

  }


  localStorage.removeItem(
    STORAGE_KEY
  );


  location.reload();

}



/* =====================================================
   THEME
   ===================================================== */

function updateTheme() {

  document.body
    .classList.toggle(
      "dark",
      data.dark
    );


  el(
    "themeBtn"
  ).textContent =
    data.dark
      ? "☀️"
      : "🌙";

}


el(
  "themeBtn"
)
.addEventListener(
  "click",
  function() {

    data.dark =
      !data.dark;


    saveData();

    updateTheme();

  }
);



/* =====================================================
   LOAD SETTINGS
   ===================================================== */

function loadSettings() {

  el(
    "rateInput"
  ).value =
    data.exchangeRate;


  el(
    "salaryInput"
  ).value =
    data.salary || "";


  el(
    "savePercent"
  ).value =
    data.savePercent;


  el(
    "expensePercent"
  ).value =
    data.expensePercent;


  el(
    "familyPercent"
  ).value =
    data.familyPercent;


  el(
    "otherPercent"
  ).value =
    data.otherPercent;


  el(
    "goalName"
  ).value =
    data.goalName;


  el(
    "goalInput"
  ).value =
    data.goal;


  el(
    "goalDate"
  ).value =
    data.goalDate || "";


  el(
    "transactionDate"
  ).value =
    today();


  updateTheme();

}



/* =====================================================
   UPDATE EVERYTHING
   ===================================================== */

function updateAll() {

  updateHome();

  updateGoal();

  updateSalary();

  renderTransactions();

}



/* =====================================================
   START
   ===================================================== */

loadSettings();

updateAll();
