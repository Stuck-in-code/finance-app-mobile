import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import * as Linking from "expo-linking";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { styles } from "../../assets/auth.styles.js";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors.js";
import PageLoader from "../../components/PageLoader.jsx";

export default function Page() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    const { error } = await signIn.password({
      emailAddress,
      password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            // Handle pending session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            Linking.openURL(url);
          } else {
            router.push(url);
          }
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
    } else if (signIn.status === "needs_client_trust") {
      // For other second factor strategies,
      // see https://clerk.com/docs/guides/development/custom-flows/authentication/client-trust
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      // Check why the sign-in is not complete
      console.error("Sign-in attempt not complete:", signIn);
    }
    setIsLoading(false);
  };

  if (isLoading) return <PageLoader />;

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            // Handle pending session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/");
          if (url.startsWith("http")) {
          } else {
            router.push(url);
          }
        },
      });
    } else {
      // Check why the sign-in is not complete
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  if (signIn.status === "needs_client_trust") {
    return (
      <View style={styles.container}>
        <Text
          type="title"
          style={[styles.title, { fontSize: 24, fontWeight: "bold" }]}
        >
          Verify your account
        </Text>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#666666"
          onChangeText={(code) => setCode(code)}
          keyboardType="numeric"
        />
        {errors.fields.code && (
          <Text style={styles.error}>{errors.fields.code.message}</Text>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            fetchStatus === "fetching" && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleVerify}
          disabled={fetchStatus === "fetching"}
        >
          <Text style={styles.buttonText}>Verify</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => signIn.mfa.sendEmailCode()}
        >
          <Text style={styles.secondaryButtonText}>I need a new code</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => signIn.reset()}
        >
          <Text style={styles.secondaryButtonText}>Start over</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      anableOnAndroid={true}
      anableAutomaticScroll={true}
      extraScrollHeight={100}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/revenue-i4.png")}
          style={styles.illustration}
        />

        <Text type="title" style={styles.title}>
          Welcome Back
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={[styles.input, error && styles.errorInput]}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#666666"
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
          keyboardType="email-address"
        />
        {errors.fields.identifier && (
          <Text style={styles.error}>
            {setError(errors.fields.identifier.message)}
          </Text>
        )}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, error && styles.errorInput]}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#666666"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        {errors.fields.password && (
          <Text style={styles.error}>
            {setError(errors.fields.password.message)}
          </Text>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            (!emailAddress || !password || fetchStatus === "fetching") &&
              styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSubmit}
          disabled={!emailAddress || !password || fetchStatus === "fetching"}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
        {/* For your debugging purposes. You can just console.log errors, but we put them in the UI for convenience */}
        {/* {errors && (
        <Text style={styles.debug}>
          {JSON.stringify(errors, null, 2)}
        </Text>
      )} */}

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/sign-up">
            <Text type="link" style={styles.linkText}>
              Sign up
            </Text>
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     gap: 12,
//   },
//   title: {
//     marginBottom: 8,
//   },
//   label: {
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     backgroundColor: "#fff",
//   },
//   button: {
//     backgroundColor: "#0a7ea4",
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 8,
//   },
//   buttonPressed: {
//     opacity: 0.7,
//   },
//   buttonDisabled: {
//     opacity: 0.5,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   secondaryButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 8,
//   },
//   secondaryButtonText: {
//     color: "#0a7ea4",
//     fontWeight: "600",
//   },
//   linkContainer: {
//     flexDirection: "row",
//     gap: 4,
//     marginTop: 12,
//     alignItems: "center",
//   },
//   error: {
//     color: "#d32f2f",
//     fontSize: 12,
//     marginTop: -8,
//   },
//   debug: {
//     fontSize: 10,
//     opacity: 0.5,
//     marginTop: 8,
//   },
// });
