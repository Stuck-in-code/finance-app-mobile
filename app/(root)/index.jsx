import { Show, useUser } from "@clerk/expo";
import { useClerk } from "@clerk/expo";
import { Link, router } from "expo-router";
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
} from "react-native";
import { useTransactions } from "../../hooks/transactionsHooks";
import { useEffect, useState } from "react";
import PageLoader from "../../components/PageLoader";
import { styles } from "../../assets/styles/home.style";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import BalanceCard from "../../components/BalanceCard";
import TransactionItem from "../../components/TransactionItem";
import NoTransactionsFound from "../../components/NoTransactionFound";

export default function Page() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { transactions, summary, isLoading, loadData, deleteTransaction } =
    useTransactions(user.id);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete", "are you sure you want to delete this item?", [
      { text: "Cancel", style: "calcel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTransaction(id),
      },
    ]);
  };

  const handleSignOut = async () => {
    Alert.alert("Logout", "are you sure you want to logout?", [
      { text: "Cancel", style: "calcel" },
      { text: "Logout", style: "destructive", onPress: signOut },
    ]);
  };
  
  if (isLoading && !refreshing) return <PageLoader />;
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          {/* LEFT */}
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.usernameText}>
                {user?.emailAddresses[0]?.emailAddress.split("@")[0]}
              </Text>
            </View>
          </View>
          {/* RIGHT */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <Pressable
              style={styles.logoutButton}
              onPress={() => handleSignOut()}
            >
              <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
            </Pressable>
          </View>
        </View>
        {/* BALANCE CARD */}
        <BalanceCard summary={summary} />
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>
        </View>
      </View>

      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={transactions}
        renderItem={({ item }) => (
          <TransactionItem item={item} onDelete={handleDelete} />
        )}
        ListEmptyComponent={<NoTransactionsFound />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
