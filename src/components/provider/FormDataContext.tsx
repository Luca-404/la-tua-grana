import React, { createContext, useContext } from "react";
import { RetirementFundFormData } from "@/lib/types";

const FormDataContext = createContext<RetirementFundFormData | undefined>(undefined);

export const useFormData = () => {
  const context = useContext(FormDataContext);
  if (!context) throw new Error("useFormData must be used within a FormDataProvider");
  return context;
};

export const FormDataProvider = ({ value, children }: { value: RetirementFundFormData; children: React.ReactNode }) => (
  <FormDataContext.Provider value={value}>{children}</FormDataContext.Provider>
);
