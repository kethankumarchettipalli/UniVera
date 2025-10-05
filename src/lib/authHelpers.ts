// src/lib/authHelpers.ts
import { auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  deleteUser,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Result type for safeSignUp
 */
export type SafeSignUpResult =
  | { ok: true; uid: string }
  | { ok: false; reason: string; error?: any };

/**
 * Create auth user + firestore user doc. If firestore write fails, delete the auth user to avoid orphan.
 *
 * profileData can include: displayName, phoneNumber, dateOfBirth, gender, location, interests, preferences, etc.
 */
export async function safeSignUp(
  email: string,
  password: string,
  profileData: Record<string, any> = {}
): Promise<SafeSignUpResult> {
  if (!email || !password) return { ok: false, reason: "invalid_input" };

  // 1) Pre-check: helpful friendly message if email already used (non-blocking)
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods && methods.length > 0) {
      return { ok: false, reason: "email_exists" };
    }
  } catch (e) {
    // not fatal; continue
    console.warn("[safeSignUp] fetchSignInMethodsForEmail failed (continuing):", e);
  }

  // 2) Create auth user
  let userCred;
  try {
    userCred = await createUserWithEmailAndPassword(auth, email, password);
  } catch (err: any) {
    const code = err?.code || "";
    if (code.includes("email-already-in-use")) {
      return { ok: false, reason: "email_exists", error: err };
    }
    console.error("[safeSignUp] createUserWithEmailAndPassword failed:", err);
    return { ok: false, reason: "auth_failed", error: err };
  }

  const user: User = userCred.user;

  // 3) Update displayName on auth profile if provided (optional)
  try {
    if (profileData.displayName) {
      await updateProfile(user, { displayName: profileData.displayName });
    }
  } catch (updErr) {
    console.warn("[safeSignUp] updateProfile failed (continuing):", updErr);
  }

  // 4) Write Firestore user doc; rollback auth user on failure
  try {
    const userDocRef = doc(db, "users", user.uid);
    const payload = {
      uid: user.uid,
      email: user.email,
      displayName: profileData.displayName || "",
      phoneNumber: profileData.phoneNumber || profileData.phone || "",
      dateOfBirth: profileData.dateOfBirth || null,
      gender: profileData.gender || null,
      location: profileData.location || "",
      interests: Array.isArray(profileData.interests) ? profileData.interests : [],
      preferences: profileData.preferences || { notifications: true, newsletter: !!profileData.subscribeNewsletter, darkMode: false, language: "en" },
      createdAt: serverTimestamp(),
      isActive: true,
      // keep favorites for backward compatibility
      favorites: { colleges: [], pgs: [] },
      // include any other safe metadata
    };

    await setDoc(userDocRef, payload);

    // 5) Send verification email (best-effort)
    try {
      await sendEmailVerification(user);
    } catch (vErr) {
      console.warn("[safeSignUp] sendEmailVerification failed (non-fatal):", vErr);
    }

    return { ok: true, uid: user.uid };
  } catch (fireErr) {
    console.error("[safeSignUp] Failed to write user doc — attempting rollback:", fireErr);
    // rollback - delete auth user to avoid orphan
    try {
      await deleteUser(user);
      console.log("[safeSignUp] Rolled back newly created auth user:", user.uid);
    } catch (delErr) {
      console.error("[safeSignUp] Rollback deletion failed - manual cleanup required:", delErr);
      return { ok: false, reason: "firestore_failed_rollback_failed", error: { fireErr, delErr } };
    }
    return { ok: false, reason: "firestore_failed", error: fireErr };
  }
}
