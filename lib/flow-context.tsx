"use client"
import { createContext, useContext } from "react";

type FlowContextType = {
   updateNodeData: (id: string, value: string) => void
};

export const FlowContext = createContext<FlowContextType | null>(null);

export function useFlowContext() {
   const ctx = useContext(FlowContext);
   if (!ctx) {
      throw new Error("useFlowContext must be used inside FlowContext.Provider");
      }
   return ctx;
}