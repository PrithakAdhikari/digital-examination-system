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
