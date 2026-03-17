"use client";

import { useEffect } from "react";

export default function AuthRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const action = params.get("action");
    const userId = params.get("userId");
    const secret = params.get("secret");

    const deepLink = `cloudnest://auth?action=${action}&userId=${userId}&secret=${secret}`;

    window.location.href = deepLink;
  }, []);

  return <p>Redirecting...</p>;
}