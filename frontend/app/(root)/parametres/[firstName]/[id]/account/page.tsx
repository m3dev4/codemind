"use client";

import { useAuthState } from "@/stores/auth/authState";

const AccountPage = () => {
  const { user } = useAuthState();

  return (
    <h1>AccountPage</h1>
  );
};

export default AccountPage;
