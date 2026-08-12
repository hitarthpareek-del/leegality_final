import { useContext } from "react";
import { CompanyContext } from "./CompanyContext";

export default function useCompany() {
  return useContext(CompanyContext);
}