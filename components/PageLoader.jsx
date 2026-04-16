import { View, Text, ActivityIndicator } from "react-native";
import { styles } from "../assets/styles/home.style";
import { COLORS } from "../constants/colors";

const pageLoader = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
};

export default pageLoader;
