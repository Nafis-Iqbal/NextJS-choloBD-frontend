/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from '@tanstack/react-query';
import { WalletStatus } from '@/types/enums';

interface WalletRechargeData {
  walletRechargeOptionId: string;
}

interface WalletRefundData {
  transactionId: string;
  amount: number;
  reason: string;
}

interface WalletStatusUpdate {
  walletStatus: WalletStatus;
}

interface CreateWalletRechargeOptionData {
  title: string;
  description: string;
  rechargeAmount: number;
  rechargeCost: number;
  bonusAmount: number;
}

interface UpdateWalletRechargeOptionData {
  title?: string;
  description?: string;
  rechargeAmount?: number;
  rechargeCost?: number;
  bonusAmount?: number;
}

// API Methods (exactly 8)

async function getMyWallet() {
  const response = await apiFetch<ApiResponse<Wallet>>('/wallets/own-wallet', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export function useGetMyWalletRQ() {
  return useQuery<ApiResponse<Wallet>>({
    queryFn: () => getMyWallet(),
    queryKey: ["myWallet"],
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

async function getWalletTransactionDetail(transactionId: string) {
  const response = await apiFetch<ApiResponse<WalletTransaction>>(`/wallets/own-wallet/transactions/${transactionId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export function useGetWalletTransactionDetailRQ(transactionId: string) {
  return useQuery<ApiResponse<WalletTransaction>>({
    queryFn: () => getWalletTransactionDetail(transactionId),
    queryKey: ["walletTransaction", transactionId],
    enabled: !!transactionId,
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
  });
}

async function createWalletRechargeTransaction(rechargeData: WalletRechargeData) {
  const response = await apiFetch<ApiResponse<WalletTransaction>>('/wallets/recharge-transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rechargeData),
  });
  return response;
}

export function useCreateWalletRechargeTransactionRQ(
  onSuccessFn: (response: any) => void,
  onErrorFn: (error: any) => void
) {
  return useMutation({
    mutationFn: createWalletRechargeTransaction,
    onSuccess: (data) => onSuccessFn(data),
    onError: (error) => onErrorFn(error),
  });
}

async function refundWalletTransaction(refundData: WalletRefundData) {
  const response = await apiFetch<ApiResponse<WalletRefund>>('/wallets/refund-transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(refundData),
  });
  return response;
}

export function useRefundWalletTransactionRQ(
  onSuccessFn: (response: any) => void,
  onErrorFn: (error: any) => void
) {
  return useMutation({
    mutationFn: refundWalletTransaction,
    onSuccess: (data) => onSuccessFn(data),
    onError: (error) => onErrorFn(error),
  });
}

async function getWalletById(walletId: string) {
  const response = await apiFetch<ApiResponse<Wallet>>(`/wallets/${walletId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export function useGetWalletByIdRQ(walletId: string) {
  return useQuery<ApiResponse<Wallet>>({
    queryFn: () => getWalletById(walletId),
    queryKey: ["wallet", walletId],
    enabled: !!walletId,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

async function getWalletByUser(userId: string) {
  const response = await apiFetch<ApiResponse<Wallet>>(`/wallets/user/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export function useGetWalletByUserRQ(userId: string) {
  return useQuery<ApiResponse<Wallet>>({
    queryFn: () => getWalletByUser(userId),
    queryKey: ["userWallet", userId],
    enabled: !!userId,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

async function getWalletTransactionByUser(userId: string, transactionId: string) {
  const response = await apiFetch<ApiResponse<WalletTransaction>>(`/wallets/user/${userId}/transactions/${transactionId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export function useGetWalletTransactionByUserRQ(userId: string, transactionId: string) {
  return useQuery<ApiResponse<WalletTransaction>>({
    queryFn: () => getWalletTransactionByUser(userId, transactionId),
    queryKey: ["userWalletTransaction", userId, transactionId],
    enabled: !!userId && !!transactionId,
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
  });
}

async function updateWalletStatus(walletId: string, statusData: WalletStatusUpdate) {
  const response = await apiFetch<ApiResponse<Wallet>>(`/wallets/${walletId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(statusData),
  });
  return response;
}

export function useUpdateWalletStatusRQ(
  onSuccessFn: (response: any) => void,
  onErrorFn: (error: any) => void
) {
  return useMutation({
    mutationFn: ({ walletId, statusData }: { walletId: string; statusData: WalletStatusUpdate }) =>
      updateWalletStatus(walletId, statusData),
    onSuccess: (data) => onSuccessFn(data),
    onError: (error) => onErrorFn(error),
  });
}

async function getWalletRechargeOptions() {
  const response = await apiFetch<ApiResponse<WalletRechargeOption[]>>('/wallets/recharge-options', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export function useGetWalletRechargeOptionsRQ() {
  return useQuery<ApiResponse<WalletRechargeOption[]>>({
    queryFn: () => getWalletRechargeOptions(),
    queryKey: ["walletRechargeOptions"],
    staleTime: 5 * 60_000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

async function getWalletRechargeOptionById(optionId: string) {
  const response = await apiFetch<ApiResponse<WalletRechargeOption>>(`/wallets/recharge-options/${optionId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export function useGetWalletRechargeOptionByIdRQ(optionId: string) {
  return useQuery<ApiResponse<WalletRechargeOption>>({
    queryFn: () => getWalletRechargeOptionById(optionId),
    queryKey: ["walletRechargeOption", optionId],
    enabled: !!optionId,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

async function createWalletRechargeOption(optionData: CreateWalletRechargeOptionData) {
  const response = await apiFetch<ApiResponse<WalletRechargeOption>>('/wallets/recharge-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(optionData),
  });
  return response;
}

export function useCreateWalletRechargeOptionRQ(
  onSuccessFn: (response: any) => void,
  onErrorFn: (error: any) => void
) {
  return useMutation({
    mutationFn: createWalletRechargeOption,
    onSuccess: (data) => onSuccessFn(data),
    onError: (error) => onErrorFn(error),
  });
}

async function updateWalletRechargeOption(walletOptionId: string, optionData: UpdateWalletRechargeOptionData) {
  const response = await apiFetch<ApiResponse<WalletRechargeOption>>(`/wallets/recharge-options/${walletOptionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(optionData),
  });
  return response;
}

export function useUpdateWalletRechargeOptionRQ(
  onSuccessFn: (response: any) => void,
  onErrorFn: (error: any) => void
) {
  return useMutation({
    mutationFn: ({ walletOptionId, optionData }: { walletOptionId: string; optionData: UpdateWalletRechargeOptionData }) =>
      updateWalletRechargeOption(walletOptionId, optionData),
    onSuccess: (data) => onSuccessFn(data),
    onError: (error) => onErrorFn(error),
  });
}

async function deleteWalletRechargeOption(walletOptionId: string) {
  const response = await apiFetch<ApiResponse<{ message: string }>>(`/wallets/recharge-options/${walletOptionId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export function useDeleteWalletRechargeOptionRQ(
  onSuccessFn: (response: any) => void,
  onErrorFn: (error: any) => void
) {
  return useMutation({
    mutationFn: deleteWalletRechargeOption,
    onSuccess: (data) => onSuccessFn(data),
    onError: (error) => onErrorFn(error),
  });
}

export type {
  WalletRechargeData,
  WalletRefundData,
  WalletStatusUpdate,
  WalletRechargeOption,
  CreateWalletRechargeOptionData,
  UpdateWalletRechargeOptionData,
};