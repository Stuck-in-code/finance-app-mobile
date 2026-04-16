// react custom hook. its not react native specific
import { API_URL } from "../constants/Api";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

//const API_URL = "https://finance-app-dxg8.onrender.com/api";
//const API_URL = "http://localhost:8000/api";

export const useTransactions = (userId) => {
  const [transactions, setTransaction] = useState([]);
  const [summary, setSummary] = useState({
    income: 0,
    balance: 0,
    expense: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransctions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/transaction/${userId}`);
      const data = await res.json();
      setTransaction(data);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  }, [userId]);

  const fetchsummary = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/transaction/summary/${userId}`);
      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching transactions summary", error);
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      // both functions can be run in parallel
      await Promise.all([fetchTransctions(), fetchsummary()]);
    } catch (error) {
      console.error("error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const deleteTransaction = async (id) => {
    try {
      const res = await fetch(`${API_URL}/transaction/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("failed to delete transaction");

      // refresh data after deletion
      loadData();
      Alert.alert("Success", "Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction", error);
      Alert.alert("Error", error.message);
    }
  };

  return { transactions, summary, isLoading, loadData, deleteTransaction };
};
