"use client";

import { Client, Account } from "appwrite";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

const client = new Client()
  .setEndpoint(ENDPOINT!)
  .setProject(PROJECT_ID!);

const account = new Account(client);

export default function AuthRedirect() {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [status, setStatus] = useState<"loading" | "success" | "form" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function handleAction() {
      if (!action || !userId || !secret) {
        setStatus("error");
        setMessage("Invalid link.");
        return;
      }

      if (action === "verify-email") {
        try {
          await account.updateVerification(userId, secret);
          setStatus("success");
          setMessage("✅ Email verified! You can now return to the CloudNest app.");
        } catch (err: unknown) {
          setStatus("error");
          setMessage("❌ " + (err instanceof Error ? err.message : "Verification failed or link expired."));
        }
      }

      if (action === "reset-password") {
        setStatus("form"); // show password reset form
      }
    }

    handleAction();
  }, [action, userId, secret]);

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      await account.updateRecovery(userId!, secret!, newPassword);
      setStatus("success");
      setMessage("✅ Password reset successful! You can now log in to the app.");
    } catch (err: unknown) {
      setStatus("error");
      setMessage("❌ " + (err instanceof Error ? err.message : "Failed to reset password. Link may be expired."));
    }
  };

  if (status === "loading") return <p>Processing...</p>;
  if (status === "error" || status === "success") return <p>{message}</p>;
  if (status === "form") {
    return (
      <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
        <h2>Reset Password</h2>
        {message && <p style={{ color: "red" }}>{message}</p>}
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <button
          onClick={handlePasswordReset}
          style={{ padding: 10, width: "100%", cursor: "pointer" }}
        >
          Reset Password
        </button>
      </div>
    );
  }

  return null;
}