import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { colors, fontSize, spacing, radius } from "../lib/theme";

const DEV_EMAIL = "test@test.com";
const DEV_PASSWORD = "test123456";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    const { error } = isSignUp
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else if (isSignUp) {
      Alert.alert("Success", "Check your email to confirm your account!");
    }
  };

  const handleDevLogin = async () => {
    setDevLoading(true);
    try {
      // Try signing in first
      const { error: signInError } = await signIn(DEV_EMAIL, DEV_PASSWORD);
      if (!signInError) {
        setDevLoading(false);
        return;
      }

      // If sign-in fails, create the test user via admin API (service role key)
      const { error: createError } = await supabase.auth.admin.createUser({
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
        email_confirm: true,
      });

      if (createError && !createError.message.includes("already")) {
        Alert.alert("Error", createError.message);
        setDevLoading(false);
        return;
      }

      // Now sign in
      const { error } = await signIn(DEV_EMAIL, DEV_PASSWORD);
      if (error) {
        Alert.alert("Error", error.message);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Dev login failed");
    } finally {
      setDevLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>📝</Text>
          <Text style={styles.title}>TriageNotes</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? "Sign Up" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchText}>
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          {/* Dev Login */}
          <View style={styles.devDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>DEV</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.devButton, devLoading && styles.buttonDisabled]}
            onPress={handleDevLogin}
            disabled={devLoading}
            activeOpacity={0.8}
          >
            {devLoading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.devButtonText}>
                ⚡ Dev Login (test@test.com)
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.hero,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: "700",
  },
  switchButton: {
    alignItems: "center",
    padding: spacing.md,
  },
  switchText: {
    color: colors.accent,
    fontSize: fontSize.sm,
  },
  devDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "700",
    marginHorizontal: spacing.md,
    letterSpacing: 2,
  },
  devButton: {
    backgroundColor: colors.warning + "20",
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.warning + "40",
  },
  devButtonText: {
    color: colors.warning,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
});
