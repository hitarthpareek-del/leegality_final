import { createContext, useEffect, useState } from "react";

export const CompanyContext = createContext();

const DEFAULT_COMPANY = "Mediccapress";

export default function CompanyProvider({ children }) {
  const [selectedCompany, setSelectedCompany] = useState(() => {
    return (
      localStorage.getItem("selectedCompany") ||
      DEFAULT_COMPANY
    );
  });

  const companies = [
    "Mediccapress",
    "Akar",
  ];

  useEffect(() => {
    localStorage.setItem(
      "selectedCompany",
      selectedCompany
    );
  }, [selectedCompany]);

  return (
    <CompanyContext.Provider
      value={{
        companies,
        selectedCompany,
        setSelectedCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}