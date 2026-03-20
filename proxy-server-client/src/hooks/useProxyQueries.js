import { useMutation, useQuery } from "@tanstack/react-query";
import * as proxyApi from "../api/proxyApi.js";

export function useSaveProvisionKey() {
  return useMutation({
    mutationFn: proxyApi.saveProvisionKey,
  });
}

export function useRegisterWithMainServer() {
  return useMutation({
    mutationFn: proxyApi.registerWithMainServer,
  });
}

export function useRegistrationStatus() {
  return useQuery({
    queryKey: ["registration-status"],
    queryFn: proxyApi.getRegistrationStatus,
  });
}

export function useExaminations() {
  return useQuery({
    queryKey: ["examinations"],
    queryFn: proxyApi.getExaminations,
  });
}

export function useSelectExamination() {
  return useMutation({
    mutationFn: proxyApi.selectExamination,
  });
}

export function useQuestions() {
    return useQuery({
      queryKey: ["local-questions"],
      queryFn: proxyApi.getQuestions,
      refetchInterval: 5000, // Poll every 5 seconds if we are waiting
    });
}

export function useRemoveExamination() {
  return useMutation({
    mutationFn: proxyApi.removeExamination,
  });
}
