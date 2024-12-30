import Web3 from "web3";
import axios from "axios";

const API_KEY = "13827f8b8c521443da97ed54d4d6a891"; // کلید Airstack
const API_URL = "https://api.airstack.xyz/gql"; // آدرس API

const button = document.getElementById("transaction-btn");
const resultDiv = document.getElementById("result");

// کوئری GraphQL برای دریافت تراکنش‌ها
const getTransactionsQuery = (walletAddress) => `
    query GetTransactions {
        ethereum(network: base) {
            address(address: {is: "${walletAddress}"}) {
                transactions {
                    count
                    value {
                        aggregate {
                            usd
                        }
                    }
                }
            }
        }
    }
`;

// دریافت اطلاعات تراکنش‌ها
async function fetchTransactions(walletAddress) {
    try {
        const response = await axios.post(
            API_URL,
            { query: getTransactionsQuery(walletAddress) },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                },
            }
        );

        const transactionData = response.data.data.ethereum.address[0].transactions;
        const transactionCount = transactionData.count;
        const totalValueInUsd = transactionData.value.aggregate.usd;

        return { transactionCount, totalValueInUsd };
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw new Error("Failed to fetch transaction data.");
    }
}

// تابع اصلی
async function getTotalTransactions() {
    try {
        if (window.ethereum) {
            const web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const walletAddress = accounts[0];

            resultDiv.textContent = "Fetching transactions...";
            resultDiv.className = "loading";

            const { transactionCount, totalValueInUsd } = await fetchTransactions(walletAddress);

            resultDiv.className = ""; // حذف استایل Loading
            resultDiv.innerHTML = `
                Total Transactions: <span style="color: #1d4ed8;">${transactionCount}</span><br>
                Total Value: <span style="color: #10b981;">$${totalValueInUsd.toFixed(2)}</span>
            `;
        } else {
            resultDiv.textContent = "Please install a wallet like MetaMask.";
        }
    } catch (error) {
        resultDiv.textContent = "Error fetching transactions.";
        resultDiv.className = "";
    }
}

// اتصال رویداد کلیک
button.addEventListener("click", getTotalTransactions);
