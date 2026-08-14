/* =========================================
   TAIWAN IPON
   Salary + Savings + Expense Tracker
========================================= */

const STORAGE_KEY = "taiwan_ipon_v1";


/* =========================================
   DEFAULT DATA
========================================= */

let data =
  JSON.parse(
    localStorage.getItem(STORAGE_KEY)
  ) ||
  {

    exchangeRate: 1.85,

    salary: 0,

    savingsPercent: 40,

    expensePercent: 35,

    familyPercent: 15,

    otherPercent: 10,

    goalName: "My Taiwan Savings",

    goalAmount: 150000,

    goalDate: "",

    darkMode: false,

    hideBalance: false,

    transactions: []

  };


let currentTransactionType = "expense";

let currentFilter = "all";


/* =========================================
   HELPERS
========================================= */

function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

}


function $(id) {

  return document.getElementById(id);

}


function formatNT(amount) {

  return (
    "NT$" +
    Number(amount || 0)
      .toLocaleString(
        "en-US",
        {
          maximumFractionDigits: 2
        }
      )
  );

}


function formatPHP(amount) {

  return (
    "₱" +
    (
      Number(amount || 0)
      *
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


function today() {

  return new Date()
    .toISOString()
    .split("T")[0];

}


/* =========================================
   TOTALS
========================================= */

function getTotals() {

  let income = 0;

  let savings = 0;

  let expenses = 0;

  let family = 0;

  let others = 0;


  data.transactions.forEach(
    transaction => {

      if (
        transaction.type === "income"
      ) {

        income += transaction.amount;

      }


      if (
        transaction.type === "saving"
      ) {

        savings += transaction.amount;

      }


      if (
        transaction.type === "expense"
      ) {

        expenses += transaction.amount;

      }


      if (
        transaction.type === "family"
      ) {

        family += transaction.amount;

      }


      if (
        transaction.type === "other"
      ) {

        others += transaction.amount;

      }

    }
  );


  return {

    income,

    savings,

    expenses,

    family,

    others

  };

}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

  const toast = $("toast");

  toast.textContent = message;

  toast.classList.add("show");


  clearTimeout(
    window.toastTimer
  );


  window.toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2200
    );

}


/* =========================================
   NAVIGATION
========================================= */

function showScreen(screenName) {

  document
    .querySelectorAll(".screen")
    .forEach(
      screen =>
        screen.classList.remove(
          "active"
        )
    );


  const target =
    $(screenName);


  if (target) {

    target.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(".nav")
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.screen ===
          screenName
        );

      }
    );


  window.scrollTo(
    {
      top: 0,
      behavior: "smooth"
    }
  );

}


document
  .querySelectorAll(".nav")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          showScreen(
            button.dataset.screen
          );

        }
      );

    }
  );


/* =========================================
   HOME
========================================= */

function renderHome() {

  const totals =
    getTotals();


  const saved =
    totals.savings;


  const percentage =
    data.goalAmount > 0
      ?
      Math.min(
        100,
        (saved / data.goalAmount) * 100
      )
      :
      0;


  /* Balance */

  if (data.hideBalance) {

    $("totalSavings").textContent =
      "••••••";

    $("totalSavingsPHP").textContent =
      "••••••";

  } else {

    $("totalSavings").textContent =
      formatNT(saved);

    $("totalSavingsPHP").textContent =
      formatPHP(saved);

  }


  $("rateDisplay").textContent =
    data.exchangeRate.toFixed(4);


  $("goalPercent").textContent =
    percentage.toFixed(0) + "%";


  $("goalProgress").style.width =
    percentage + "%";


  $("savedText").textContent =
    formatNT(saved) + " saved";


  $("goalText").textContent =
    "Goal " +
    formatNT(data.goalAmount);


  /* Salary */

  $("salaryDisplay").textContent =
    formatNT(data.salary);


  $("salaryPHP").textContent =
    formatPHP(data.salary);


  $("recommendedSaving").textContent =
    formatNT(
      data.salary *
      data.savingsPercent /
      100
    );


  renderTransactions(
    "recentTransactions",
    3,
    "all"
  );

}


/* =========================================
   HIDE BALANCE
========================================= */

$("hideBalance")
  .addEventListener(
    "click",
    () => {

      data.hideBalance =
        !data.hideBalance;

      saveData();

      renderHome();

      $("hideBalance")
        .textContent =
        data.hideBalance
          ? "◎"
          : "◉";

    }
  );


/* =========================================
   TRANSACTION ICONS
========================================= */

const icons = {

  income: "💵",

  saving: "🏦",

  expense: "🍜",

  family: "🇵🇭",

  other: "📦"

};


const labels = {

  income: "Income",

  saving: "Savings",

  expense: "Expense",

  family: "Family / PH",

  other: "Others"

};


/* =========================================
   RENDER TRANSACTIONS
========================================= */

function renderTransactions(
  elementId,
  limit = 999,
  filter = "all"
) {

  const container =
    $(elementId);


  let transactions =
    data.transactions
      .filter(
        transaction =>
          filter === "all" ||
          transaction.type === filter
      )
      .slice(0, limit);


  if (
    transactions.length === 0
  ) {

    container.innerHTML = `
      <div class="empty">

        📭 No transactions yet.

        <br>

        Add your first activity
        to start tracking.

      </div>
    `;

    return;

  }


  container.innerHTML =
    transactions
      .map(
        transaction => {

          const positive =
            transaction.type === "income" ||
            transaction.type === "saving";


          return `

            <div class="transaction">

              <div class="tx-icon">

                ${icons[transaction.type]}

              </div>


              <div class="tx-info">

                <b>
                  ${escapeHTML(
                    transaction.description
                  )}
                </b>

                <span>

                  ${transaction.date}

                  •
                  ${labels[transaction.type]}

                </span>

              </div>


              <div class="tx-money">

                <b class="${
                  positive
                    ? "plus"
                    : "minus"
                }">

                  ${
                    positive
                      ? "+"
                      : "-"
                  }

                  ${formatNT(
                    transaction.amount
                  )}

                </b>


                <span>

                  ${formatPHP(
                    transaction.amount
                  )}

                </span>

              </div>


              <button
                class="delete"
                onclick="deleteTransaction(
                  ${transaction.id}
                )"
              >

                ×

              </button>

            </div>

          `;

        }
      )
      .join("");

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

  return String(text)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


/* =========================================
   ACTIVITY FILTER
========================================= */

document
  .querySelectorAll(".filter")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(".filter")
            .forEach(
              b =>
                b.classList.remove(
                  "active"
                )
            );


          button.classList.add(
            "active"
          );


          currentFilter =
            button.dataset.filter;


          renderTransactions(
            "allTransactions",
            999,
            currentFilter
          );

        }
      );

    }
  );


/* =========================================
   SAVINGS PAGE
========================================= */

function renderSavings() {

  const totals =
    getTotals();


  const saved =
    totals.savings;


  let percentage = 0;


  if (
    data.goalAmount > 0
  ) {

    percentage =
      Math.min(
        100,
        saved /
        data.goalAmount *
        100
      );

  }


  $("ringPercent")
    .textContent =
    percentage.toFixed(0) + "%";


  $("goalRing")
    .style.background =
      `
      conic-gradient(
        var(--pink)
        ${percentage * 3.6}deg,

        rgba(255,255,255,.12)
        ${percentage * 3.6}deg
      )
      `;


  $("goalName").textContent =
    data.goalName ||
    "My Taiwan Savings";


  $("goalAmount").textContent =
    formatNT(
      data.goalAmount
    );


  $("goalPHP").textContent =
    formatPHP(
      data.goalAmount
    );


  $("savedAmount").textContent =
    formatNT(saved);


  $("savedPHP").textContent =
    formatPHP(saved);


  const remaining =
    Math.max(
      0,
      data.goalAmount - saved
    );


  $("remainingAmount").textContent =
    formatNT(remaining);


  $("remainingPHP").textContent =
    formatPHP(remaining);


  $("goalNameInput").value =
    data.goalName;


  $("goalInput").value =
    data.goalAmount;


  $("goalDate").value =
    data.goalDate || "";

}


/* =========================================
   SAVE GOAL
========================================= */

$("saveGoal")
  .addEventListener(
    "click",
    () => {

      const amount =
        Number(
          $("goalInput").value
        );


      if (
        amount <= 0
      ) {

        alert(
          "Please enter a valid goal."
        );

        return;

      }


      data.goalName =
        $("goalNameInput")
          .value
          .trim()
        ||
        "My Taiwan Savings";


      data.goalAmount =
        amount;


      data.goalDate =
        $("goalDate").value;


      saveData();

      renderAll();

      showToast(
        "Savings goal updated 🎯"
      );

    }
  );


/* =========================================
   SALARY
========================================= */

function renderSalary() {

  $("salaryInput").value =
    data.salary || "";


  $("salaryPHPBig")
    .textContent =
    formatPHP(
      data.salary
    );


  $("saveRange").value =
    data.savingsPercent;


  $("expenseRange").value =
    data.expensePercent;


  $("familyRange").value =
    data.familyPercent;


  $("otherRange").value =
    data.otherPercent;


  const total =
    data.savingsPercent +
    data.expensePercent +
    data.familyPercent +
    data.otherPercent;


  $("allocationTotal")
    .textContent =
    total + "%";


  $("allocationWarning")
    .classList.toggle(
      "hidden",
      total === 100
    );


  $("savePercent")
    .textContent =
    data.savingsPercent + "%";


  $("expensePercent")
    .textContent =
    data.expensePercent + "%";


  $("familyPercent")
    .textContent =
    data.familyPercent + "%";


  $("otherPercent")
    .textContent =
    data.otherPercent + "%";


  $("saveAmount")
    .textContent =
    formatNT(
      data.salary *
      data.savingsPercent /
      100
    );


  $("expenseAmount")
    .textContent =
    formatNT(
      data.salary *
      data.expensePercent /
      100
    );


  $("familyAmount")
    .textContent =
    formatNT(
      data.salary *
      data.familyPercent /
      100
    );


  $("otherAmount")
    .textContent =
    formatNT(
      data.salary *
      data.otherPercent /
      100
    );

}


/* =========================================
   SALARY INPUT
========================================= */

$("salaryInput")
  .addEventListener(
    "input",
    () => {

      data.salary =
        Number(
          $("salaryInput").value
        ) || 0;


      saveData();

      renderSalary();

      renderHome();

    }
  );


/* =========================================
   ALLOCATION SLIDERS
========================================= */

$("saveRange")
  .addEventListener(
    "input",
    updateAllocation
  );


$("expenseRange")
  .addEventListener(
    "input",
    updateAllocation
  );


$("familyRange")
  .addEventListener(
    "input",
    updateAllocation
  );


$("otherRange")
  .addEventListener(
    "input",
    updateAllocation
  );


function updateAllocation() {

  data.savingsPercent =
    Number(
      $("saveRange").value
    );


  data.expensePercent =
    Number(
      $("expenseRange").value
    );


  data.familyPercent =
    Number(
      $("familyRange").value
    );


  data.otherPercent =
    Number(
      $("otherRange").value
    );


  saveData();

  renderSalary();

  renderHome();

}


/* =========================================
   SETTINGS
========================================= */

function renderSettings() {

  $("rateInput").value =
    data.exchangeRate;


  document.body
    .classList.toggle(
      "dark",
      data.darkMode
    );


  $("appearance")
    .textContent =
    data.darkMode
      ? "Dark Mode"
      : "Light Mode";


  $("themeBtn")
    .textContent =
    data.darkMode
      ? "☀"
      : "☾";

}


/* =========================================
   EXCHANGE RATE
========================================= */

$("saveRate")
  .addEventListener(
    "click",
    () => {

      const rate =
        Number(
          $("rateInput").value
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

      renderAll();

      showToast(
        "Exchange rate saved 💱"
      );

    }
  );


/* =========================================
   DARK MODE
========================================= */

$("darkMode")
  .addEventListener(
    "click",
    () => {

      data.darkMode =
        !data.darkMode;


      saveData();

      renderSettings();

    }
  );


$("themeBtn")
  .addEventListener(
    "click",
    () => {

      data.darkMode =
        !data.darkMode;


      saveData();

      renderSettings();

    }
  );


/* =========================================
   EXPORT
========================================= */

$("exportData")
  .addEventListener(
    "click",
    () => {

      const file =
        new Blob(
          [
            JSON.stringify(
              data,
              null,
              2
            )
          ],
          {
            type:
              "application/json"
          }
        );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        URL.createObjectURL(
          file
        );


      link.download =
        "taiwan-ipon-backup.json";


      link.click();


      showToast(
        "Backup exported 📤"
      );

    }
  );


/* =========================================
   IMPORT
========================================= */

$("importData")
  .addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];


      if (!file) return;


      const reader =
        new FileReader();


      reader.onload =
        () => {

          try {

            const imported =
              JSON.parse(
                reader.result
              );


            if (
              !imported.transactions
            ) {

              throw new Error();

            }


            data =
              imported;


            saveData();

            renderAll();

            showToast(
              "Backup restored 📥"
            );

          }

          catch {

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


/* =========================================
   RESET
========================================= */

$("resetData")
  .addEventListener(
    "click",
    () => {

      const confirmReset =
        confirm(
          "Delete all Taiwan Ipon data?"
        );


      if (!confirmReset) return;


      localStorage.removeItem(
        STORAGE_KEY
      );


      location.reload();

    }
  );


/* =========================================
   TRANSACTION MODAL
========================================= */

function openTransaction(
  type = "expense"
) {

  currentTransactionType =
    type;


  document
    .querySelectorAll(
      ".transaction-types button"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.type ===
          type
        );

      }
    );


  $("transactionAmount")
    .value = "";


  $("transactionDescription")
    .value = "";


  $("transactionDate")
    .value =
    today();


  $("transactionModal")
    .classList.add(
      "show"
    );

}


window.openTransaction =
  openTransaction;


/* =========================================
   TRANSACTION TYPE BUTTONS
========================================= */

document
  .querySelectorAll(
    ".transaction-types button"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          currentTransactionType =
            button.dataset.type;


          document
            .querySelectorAll(
              ".transaction-types button"
            )
            .forEach(
              b =>
                b.classList.remove(
                  "active"
                )
            );


          button.classList.add(
            "active"
          );

        }
      );

    }
  );


/* =========================================
   CLOSE MODAL
========================================= */

$("closeModal")
  .addEventListener(
    "click",
    () => {

      $("transactionModal")
        .classList.remove(
          "show"
        );

    }
  );


/* =========================================
   SUBMIT TRANSACTION
========================================= */

$("transactionForm")
  .addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const amount =
        Number(
          $("transactionAmount")
            .value
        );


      const description =
        $("transactionDescription")
          .value
          .trim();


      const date =
        $("transactionDate")
          .value;


      if (
        amount <= 0 ||
        !description ||
        !date
      ) {

        return;

      }


      data.transactions.unshift({

        id:
          Date.now(),

        type:
          currentTransactionType,

        amount:
          amount,

        description:
          description,

        date:
          date

      });


      saveData();


      $("transactionModal")
        .classList.remove(
          "show"
        );


      renderAll();


      showToast(
        "Transaction added ✅"
      );

    }
  );


/* =========================================
   DELETE TRANSACTION
========================================= */

function deleteTransaction(id) {

  const answer =
    confirm(
      "Delete this transaction?"
    );


  if (!answer) return;


  data.transactions =
    data.transactions.filter(
      transaction =>
        transaction.id !== id
    );


  saveData();

  renderAll();

  showToast(
    "Transaction deleted"
  );

}


window.deleteTransaction =
  deleteTransaction;


/* =========================================
   RENDER EVERYTHING
========================================= */

function renderAll() {

  renderHome();

  renderTransactions(
    "allTransactions",
    999,
    currentFilter
  );

  renderSavings();

  renderSalary();

  renderSettings();

}


/* =========================================
   START APP
========================================= */

renderAll();
