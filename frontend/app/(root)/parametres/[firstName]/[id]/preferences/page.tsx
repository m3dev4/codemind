"use client";

import { useState } from "react";

const PreferencesPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return <h1>PreferencesPage</h1>;
};

export default PreferencesPage;
