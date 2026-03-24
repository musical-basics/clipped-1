import React, { useRef, useState } from "react";
import { Platform, ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

const ACCENT = "#7C5CFC";
const ACCENT_LIGHT = "#9B7FFF";
const BG = "#0A0A0F";
const BG_CARD = "#16161F";
const BG_ELEVATED = "#1E1E2A";
const BORDER = "#2A2A3A";
const TEXT_PRIMARY = "#F5F5F7";
const TEXT_SECONDARY = "#8B8B9E";
const DELETE_COLOR = "#FF4D6A";
const KEEP_COLOR = "#00D68F";
const MERGE_COLOR = "#4DA6FF";

/* ─── Navbar ─── */
function Navbar({ onFeatures, onPricing, onGetAccess }: { onFeatures: () => void; onPricing: () => void; onGetAccess: () => void }) {
  return (
    <View style={s.navOuter}>
      <View style={s.navInner}>
        <View style={s.navLogo}>
          <View style={s.logoIcon}><Text style={{ color: ACCENT, fontSize: 16 }}>✂</Text></View>
          <Text style={s.logoText}>Clipped</Text>
        </View>
        <View style={s.navLinks}>
          <TouchableOpacity onPress={onFeatures}><Text style={s.navLink}>Features</Text></TouchableOpacity>
          <TouchableOpacity onPress={onPricing}><Text style={s.navLink}>Pricing</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={s.navCta} onPress={onGetAccess}><Text style={s.navCtaText}>Get Early Access</Text></TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── Hero ─── */
function Hero({ onGetAccess }: { onGetAccess: () => void }) {
  return (
    <View style={s.heroWrap}>
      <View style={s.heroGlow1} />
      <View style={s.heroGlow2} />
      <View style={s.heroContent}>
        <View style={s.badge}>
          <View style={s.badgeDot} />
          <Text style={s.badgeText}>Now accepting early access signups</Text>
        </View>
        <Text style={s.heroTitle}>
          Stop hoarding notes.{"\n"}
          <Text style={s.heroTitleAccent}>Start processing them.</Text>
        </Text>
        <Text style={s.heroSub}>
          Frictionless capture meets Tinder-style triage. Use AI to automatically merge, clean, and organize your scattered thoughts.
        </Text>
        <View style={s.heroCtas}>
          <TouchableOpacity style={s.heroPrimaryBtn} onPress={onGetAccess}>
            <Text style={s.heroPrimaryBtnText}>Get Early Access (Free)</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={s.heroSecondaryBtn}>
            <Ionicons name="play" size={18} color={TEXT_SECONDARY} />
            <Text style={s.heroSecondaryBtnText}>See how it works</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.socialProof}>Join 2,400+ early adopters already on the waitlist</Text>
      </View>
    </View>
  );
}

/* ─── Bento Grid ─── */
function BentoGrid() {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Your second brain, supercharged</Text>
      <Text style={s.sectionSub}>Four powerful features designed to eliminate digital hoarding forever</Text>

      <View style={s.bentoGrid}>
        {/* Tinder-style Triage — tall card */}
        <View style={[s.bentoCard, s.bentoTall]}>
          <Text style={s.bentoCardTitle}>Tinder-style Triage</Text>
          <Text style={s.bentoCardDesc}>Process your inbox with satisfying swipe gestures. Make decisions fast and never let notes pile up again.</Text>
          <View style={s.mockCard}>
            <View style={s.mockLine1} /><View style={s.mockLine2} /><View style={s.mockLine3} />
          </View>
          <View style={s.swipeRow}>
            <View style={s.swipeIndicator}>
              <View style={[s.swipeCircle, { backgroundColor: DELETE_COLOR + "33", borderColor: DELETE_COLOR + "50" }]}>
                <Ionicons name="arrow-back" size={20} color={DELETE_COLOR} />
              </View>
              <Text style={[s.swipeLabel, { color: DELETE_COLOR }]}>Trash</Text>
            </View>
            <View style={s.swipeIndicator}>
              <View style={[s.swipeCircle, { backgroundColor: MERGE_COLOR + "33", borderColor: MERGE_COLOR + "50" }]}>
                <Ionicons name="arrow-up" size={20} color={MERGE_COLOR} />
              </View>
              <Text style={[s.swipeLabel, { color: MERGE_COLOR }]}>AI Merge</Text>
            </View>
            <View style={s.swipeIndicator}>
              <View style={[s.swipeCircle, { backgroundColor: KEEP_COLOR + "33", borderColor: KEEP_COLOR + "50" }]}>
                <Ionicons name="arrow-forward" size={20} color={KEEP_COLOR} />
              </View>
              <Text style={[s.swipeLabel, { color: KEEP_COLOR }]}>Keep</Text>
            </View>
          </View>
        </View>

        {/* Right column — two stacked cards */}
        <View style={s.bentoRightCol}>
          {/* Frictionless Capture */}
          <View style={s.bentoCard}>
            <View style={[s.featureIcon, { backgroundColor: ACCENT + "33", borderColor: ACCENT + "50" }]}>
              <Ionicons name="keypad-outline" size={22} color={ACCENT} />
            </View>
            <Text style={s.bentoCardTitle}>Frictionless Capture</Text>
            <Text style={s.bentoCardDesc}>Opens instantly to a keyboard. Zero latency. Dump your thoughts before they vanish.</Text>
            <View style={s.keyRow}>
              {[...Array(10)].map((_, i) => <View key={i} style={s.keyBlock} />)}
            </View>
          </View>

          {/* Semantic AI Merge */}
          <View style={s.bentoCard}>
            <View style={[s.featureIcon, { backgroundColor: MERGE_COLOR + "33", borderColor: MERGE_COLOR + "50" }]}>
              <Ionicons name="git-merge-outline" size={22} color={MERGE_COLOR} />
            </View>
            <Text style={s.bentoCardTitle}>Semantic AI Merge</Text>
            <Text style={s.bentoCardDesc}>Automatically finds and merges related thoughts using vector search. Your ideas connect themselves.</Text>
            <View style={s.mergeRow}>
              <View style={[s.mergeBlock, { borderColor: MERGE_COLOR + "50" }]} />
              <Ionicons name="sparkles" size={14} color={MERGE_COLOR} />
              <View style={[s.mergeBlock, { borderColor: MERGE_COLOR + "50" }]} />
              <Ionicons name="arrow-forward" size={14} color={TEXT_SECONDARY} />
              <View style={[s.mergeBlockBig, { backgroundColor: MERGE_COLOR + "33", borderColor: MERGE_COLOR + "80" }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Wide card — Magic Wand */}
      <View style={[s.bentoCard, s.bentoWide]}>
        <View style={s.bentoWideInner}>
          <View style={{ flex: 1 }}>
            <View style={[s.featureIcon, { backgroundColor: KEEP_COLOR + "33", borderColor: KEEP_COLOR + "50" }]}>
              <Ionicons name="sparkles-outline" size={22} color={KEEP_COLOR} />
            </View>
            <Text style={s.bentoCardTitle}>Magic Wand Cleanup</Text>
            <Text style={s.bentoCardDesc}>One click turns chaotic brain-dumps into perfectly formatted bullet points using LLMs.</Text>
          </View>
          <View style={s.beforeAfter}>
            <View style={s.beforeBox}>
              <Text style={s.baLabel}>Before</Text>
              <View style={s.mockLine1} /><View style={s.mockLine2} /><View style={s.mockLine3} />
            </View>
            <View style={s.afterBox}>
              <Text style={[s.baLabel, { color: KEEP_COLOR }]}>After</Text>
              {[0, 1, 2].map(i => (
                <View key={i} style={s.afterLine}>
                  <View style={s.afterDot} />
                  <View style={[s.mockLine2, { backgroundColor: KEEP_COLOR + "50" }]} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    { num: "01", title: "Capture", desc: "Instantly dump thoughts the moment they strike. No friction, no formatting required.", color: ACCENT, icon: "download-outline" as const },
    { num: "02", title: "Triage", desc: "Swipe through your inbox daily. Trash, keep, or merge. Make decisions in seconds.", color: MERGE_COLOR, icon: "phone-portrait-outline" as const },
    { num: "03", title: "Vault", desc: "Store perfectly organized, AI-cleaned notes. Ready when you need them.", color: KEEP_COLOR, icon: "lock-closed-outline" as const },
  ];
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>How it works</Text>
      <Text style={s.sectionSub}>Three simple steps to note-taking zen</Text>
      <View style={s.stepsRow}>
        {steps.map((st) => (
          <View key={st.num} style={s.stepCard}>
            <Text style={[s.stepNum, { color: st.color }]}>{st.num}</Text>
            <View style={[s.stepIcon, { backgroundColor: st.color + "33", borderColor: st.color + "50" }]}>
              <Ionicons name={st.icon} size={26} color={st.color} />
            </View>
            <Text style={s.stepTitle}>{st.title}</Text>
            <Text style={s.stepDesc}>{st.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ─── Pricing / Waitlist ─── */
function Pricing() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const features = ["Unlimited captures", "500 AI Merges / month", "100 Magic Cleanups / month", "Early access to new features", "Priority support"];

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("waitlist")
        .insert({ email: email.trim().toLowerCase() });
      if (error && error.code === "23505") {
        // Duplicate email — treat as success
      } else if (error) {
        console.error("Waitlist error:", error);
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Waitlist error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={s.section}>
      <View style={s.pricingGlow} />
      <Text style={s.sectionTitle}>Get early access</Text>
      <Text style={s.sectionSub}>Be among the first to experience note-taking freedom</Text>
      <View style={s.pricingCard}>
        <View style={s.pricingBadge}>
          <Ionicons name="sparkles" size={14} color={ACCENT} />
          <Text style={s.pricingBadgeText}>Early Adopter</Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.priceAmount}>$0</Text>
          <Text style={s.pricePer}>/ forever</Text>
        </View>
        <Text style={s.priceSub}>Lock in free access as an early supporter</Text>
        {features.map((f) => (
          <View key={f} style={s.featureRow}>
            <View style={s.checkCircle}><Ionicons name="checkmark" size={12} color={KEEP_COLOR} /></View>
            <Text style={s.featureText}>{f}</Text>
          </View>
        ))}
        {!submitted ? (
          <View style={s.formWrap}>
            <TextInput
              style={s.emailInput}
              placeholder="Enter your email"
              placeholderTextColor={TEXT_SECONDARY}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
              <Text style={s.submitBtnText}>{submitting ? "Joining..." : "Join the Waitlist"}</Text>
            </TouchableOpacity>
            <Text style={s.trustText}>No spam. Unsubscribe anytime. 2,400+ already joined.</Text>
          </View>
        ) : (
          <View style={s.successWrap}>
            <View style={s.successCircle}><Ionicons name="checkmark" size={28} color={KEEP_COLOR} /></View>
            <Text style={s.successTitle}>You're in!</Text>
            <Text style={s.successSub}>We'll notify you when Clipped is ready.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <View style={s.footer}>
      <View style={s.footerInner}>
        <View style={s.navLogo}>
          <View style={s.logoIcon}><Text style={{ color: ACCENT, fontSize: 16 }}>✂</Text></View>
          <Text style={s.logoText}>Clipped</Text>
        </View>
        <View style={s.footerLinks}>
          <Text style={s.navLink}>Features</Text>
          <Text style={s.navLink}>Pricing</Text>
          <Text style={s.navLink}>Twitter</Text>
        </View>
        <Text style={s.copyright}>© 2026 Clipped. All rights reserved.</Text>
      </View>
    </View>
  );
}

/* ─── Main Page ─── */
export default function LandingPage() {
  const scrollRef = useRef<ScrollView>(null);
  const sectionYs = useRef<Record<string, number>>({});

  const scrollToSection = (key: string) => {
    const y = sectionYs.current[key];
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y, animated: true });
    }
  };

  return (
    <ScrollView ref={scrollRef} style={s.page} contentContainerStyle={s.pageContent}>
      <Navbar
        onFeatures={() => scrollToSection("features")}
        onPricing={() => scrollToSection("pricing")}
        onGetAccess={() => scrollToSection("pricing")}
      />
      <Hero onGetAccess={() => scrollToSection("pricing")} />
      <View onLayout={(e) => { sectionYs.current.features = e.nativeEvent.layout.y; }}>
        <BentoGrid />
      </View>
      <HowItWorks />
      <View onLayout={(e) => { sectionYs.current.pricing = e.nativeEvent.layout.y; }}>
        <Pricing />
      </View>
      <Footer />
    </ScrollView>
  );
}

/* ─── Styles ─── */
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG },
  pageContent: { paddingBottom: 0 },

  // Navbar
  navOuter: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, position: "absolute", top: 0, left: 0, right: 0, zIndex: 50 },
  navInner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: BG_CARD + "CC", borderWidth: 1, borderColor: BORDER, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12 },
  navLogo: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: ACCENT + "33", borderWidth: 1, borderColor: ACCENT + "50", alignItems: "center", justifyContent: "center" },
  logoText: { color: TEXT_PRIMARY, fontWeight: "700", fontSize: 16 },
  navLinks: { flexDirection: "row", gap: 28 },
  navLink: { color: TEXT_SECONDARY, fontSize: 14 },
  navCta: { backgroundColor: ACCENT, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20 },
  navCtaText: { color: "#FFF", fontWeight: "600", fontSize: 14 },

  // Hero
  heroWrap: { minHeight: 700, justifyContent: "center", alignItems: "center", paddingTop: 100, paddingHorizontal: 24, overflow: "hidden" },
  heroGlow1: { position: "absolute", top: "20%", left: "15%", width: 384, height: 384, borderRadius: 192, backgroundColor: ACCENT + "33", opacity: 0.3 },
  heroGlow2: { position: "absolute", bottom: "20%", right: "15%", width: 384, height: 384, borderRadius: 192, backgroundColor: ACCENT + "1A", opacity: 0.3 },
  heroContent: { alignItems: "center", maxWidth: 800, zIndex: 10 },
  badge: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, backgroundColor: BG_CARD + "CC", borderWidth: 1, borderColor: BORDER, marginBottom: 32 },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: KEEP_COLOR },
  badgeText: { color: TEXT_SECONDARY, fontSize: 14 },
  heroTitle: { fontSize: 52, fontWeight: "800", color: TEXT_PRIMARY, textAlign: "center", lineHeight: 62, marginBottom: 24 },
  heroTitleAccent: { color: ACCENT_LIGHT },
  heroSub: { color: TEXT_SECONDARY, fontSize: 18, textAlign: "center", lineHeight: 28, maxWidth: 600, marginBottom: 40 },
  heroCtas: { flexDirection: "row", gap: 16, flexWrap: "wrap", justifyContent: "center" },
  heroPrimaryBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: ACCENT, paddingHorizontal: 32, paddingVertical: 18, borderRadius: 14, shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 40 },
  heroPrimaryBtnText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  heroSecondaryBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 32, paddingVertical: 18, borderRadius: 14 },
  heroSecondaryBtnText: { color: TEXT_SECONDARY, fontSize: 18 },
  socialProof: { color: TEXT_SECONDARY + "99", fontSize: 14, marginTop: 48 },

  // Section
  section: { paddingVertical: 80, paddingHorizontal: 24, maxWidth: 900, alignSelf: "center", width: "100%" },
  sectionTitle: { color: TEXT_PRIMARY, fontSize: 32, fontWeight: "800", textAlign: "center", marginBottom: 16 },
  sectionSub: { color: TEXT_SECONDARY, fontSize: 18, textAlign: "center", marginBottom: 48 },

  // Bento
  bentoGrid: { flexDirection: "row", gap: 16 },
  bentoTall: { flex: 1 },
  bentoRightCol: { flex: 1, gap: 16 },
  bentoCard: { backgroundColor: BG_CARD + "CC", borderWidth: 1, borderColor: BORDER, borderRadius: 20, padding: 28 },
  bentoWide: { marginTop: 16 },
  bentoWideInner: { flexDirection: "row", gap: 24 },
  bentoCardTitle: { color: TEXT_PRIMARY, fontSize: 20, fontWeight: "700", marginBottom: 8 },
  bentoCardDesc: { color: TEXT_SECONDARY, fontSize: 14, lineHeight: 22, marginBottom: 20 },
  mockCard: { backgroundColor: BG_ELEVATED, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: BORDER, marginBottom: 24, alignSelf: "center", width: "80%" },
  mockLine1: { height: 10, width: "75%", backgroundColor: BORDER, borderRadius: 4, marginBottom: 10 },
  mockLine2: { height: 10, width: "50%", backgroundColor: BORDER, borderRadius: 4, marginBottom: 10 },
  mockLine3: { height: 10, width: "65%", backgroundColor: BORDER, borderRadius: 4 },
  swipeRow: { flexDirection: "row", justifyContent: "center", gap: 32 },
  swipeIndicator: { alignItems: "center", gap: 8 },
  swipeCircle: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  swipeLabel: { fontSize: 12, fontWeight: "600" },
  featureIcon: { width: 46, height: 46, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  keyRow: { flexDirection: "row", gap: 4 },
  keyBlock: { width: 20, height: 28, borderRadius: 4, backgroundColor: BORDER, borderWidth: 1, borderColor: "#3A3A4A" },
  mergeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  mergeBlock: { width: 30, height: 30, borderRadius: 8, backgroundColor: BORDER, borderWidth: 1 },
  mergeBlockBig: { width: 46, height: 30, borderRadius: 8, borderWidth: 1 },
  beforeAfter: { flex: 1, flexDirection: "row", gap: 16 },
  beforeBox: { flex: 1, backgroundColor: BG_ELEVATED, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER },
  afterBox: { flex: 1, backgroundColor: KEEP_COLOR + "1A", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: KEEP_COLOR + "50" },
  baLabel: { color: TEXT_SECONDARY, fontSize: 12, marginBottom: 10 },
  afterLine: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  afterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: KEEP_COLOR },

  // How it works
  stepsRow: { flexDirection: "row", gap: 28 },
  stepCard: { flex: 1, alignItems: "center" },
  stepNum: { fontSize: 48, fontWeight: "800", opacity: 0.15, position: "absolute", top: -10 },
  stepIcon: { width: 56, height: 56, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  stepTitle: { color: TEXT_PRIMARY, fontSize: 20, fontWeight: "700", marginBottom: 10 },
  stepDesc: { color: TEXT_SECONDARY, fontSize: 14, lineHeight: 22, textAlign: "center" },

  // Pricing
  pricingGlow: { position: "absolute", width: 600, height: 600, borderRadius: 300, backgroundColor: ACCENT + "1A", alignSelf: "center", top: 0, opacity: 0.5 },
  pricingCard: { backgroundColor: BG_CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 20, padding: 32, maxWidth: 480, alignSelf: "center", width: "100%", shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 40 },
  pricingBadge: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: ACCENT + "33", borderWidth: 1, borderColor: ACCENT + "50", alignSelf: "flex-start", marginBottom: 24 },
  pricingBadgeText: { color: ACCENT, fontSize: 14, fontWeight: "600" },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 6 },
  priceAmount: { color: TEXT_PRIMARY, fontSize: 48, fontWeight: "800" },
  pricePer: { color: TEXT_SECONDARY, fontSize: 16 },
  priceSub: { color: TEXT_SECONDARY, fontSize: 14, marginBottom: 24 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: KEEP_COLOR + "33", alignItems: "center", justifyContent: "center" },
  featureText: { color: TEXT_PRIMARY, fontSize: 15 },
  formWrap: { marginTop: 24 },
  emailInput: { backgroundColor: BG_ELEVATED, borderWidth: 1, borderColor: BORDER, borderRadius: 14, height: 52, paddingHorizontal: 20, color: TEXT_PRIMARY, fontSize: 16, marginBottom: 12 },
  submitBtn: { backgroundColor: ACCENT, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 40 },
  submitBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  trustText: { color: TEXT_SECONDARY + "99", fontSize: 12, textAlign: "center", marginTop: 12 },
  successWrap: { alignItems: "center", paddingVertical: 24 },
  successCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: KEEP_COLOR + "33", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  successTitle: { color: TEXT_PRIMARY, fontSize: 20, fontWeight: "700", marginBottom: 8 },
  successSub: { color: TEXT_SECONDARY, fontSize: 16 },

  // Footer
  footer: { borderTopWidth: 1, borderTopColor: BORDER, paddingVertical: 40, paddingHorizontal: 24 },
  footerInner: { maxWidth: 900, alignSelf: "center", width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerLinks: { flexDirection: "row", gap: 28 },
  copyright: { color: TEXT_SECONDARY + "99", fontSize: 12 },
});
