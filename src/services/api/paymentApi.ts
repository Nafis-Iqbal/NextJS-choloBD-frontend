/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from '@tanstack/react-query';
import { PaymentStatus, ServiceType } from '@/types/enums';

interface PaymentInitData {
  serviceType: ServiceType;
  serviceTypeId: string;
}

interface PaymentValidationData {
  val_id: string;
  orderId?: string;
}

// Payment transaction response interface
interface PaymentTransaction {
  id?: string;
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  gatewayResponse?: any;
  validatedAt?: Date;
  createdAt?: Date;
  val_id?: string;
  bank_tran_id?: string;
}

interface RefundData {
  transactionId: string;
  amount: number;
  reason: string;
  bank_tran_id?: string;
  refe_id?: string;
}

interface PaymentQueryParams {
  orderId?: string;
  transactionId?: string;
  status?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

async function initializePayment(paymentData: PaymentInitData) {
  const response = await apiFetch<ApiResponse<{
    transactionId: string;
    gatewayPageURL: string;
    sessionKey: string;
  }>>('/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });
  return response;
}

export function useInitializePaymentRQ(
  onSuccessFn: (response: any) => void, 
  onErrorFn: (error: any) => void
) {
  return useMutation({
    mutationFn: initializePayment,
    onSuccess: (data) => onSuccessFn(data),
    onError: (error) => onErrorFn(error),
  });
}

async function validatePayment(validationData: PaymentValidationData) {
  const response = await apiFetch<ApiResponse<PaymentTransaction>>('/payments/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validationData),
  });
  return response;
}

export function useValidatePaymentRQ(
  onSuccessFn: (response: any) => void,
  onErrorFn: (error: any) => void
) {
  return useMutation({
    mutationFn: validatePayment,
    onSuccess: (data) => onSuccessFn(data),
    onError: (error) => onErrorFn(error),
  });
}

async function initiateRefund(refundData: RefundData) {
  const response = await apiFetch<ApiResponse<{
    refundId: string;
    status: string;
    message: string;
  }>>('/payments/refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(refundData),
  });
  return response;
}

export function useInitiateRefundRQ(
  onSuccessFn: (response: any) => void,
  onErrorFn: (error: any) => void
) {
  return useMutation({
    mutationFn: initiateRefund,
    onSuccess: (data) => onSuccessFn(data),
    onError: (error) => onErrorFn(error),
  });
}

async function getRefundStatus(refundId: string) {
  const response = await apiFetch<ApiResponse<{
    refundId: string;
    status: string;
    amount: number;
    processedAt?: Date;
  }>>(`/payments/refund/${refundId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export function useGetRefundStatusRQ(refundId: string) {
  return useQuery({
    queryFn: () => getRefundStatus(refundId),
    queryKey: ["refundStatus", refundId],
    enabled: !!refundId,
    staleTime: 30_000,
    gcTime: 30 * 1000,
  });
}

async function updatePaymentStatus(paymentData: { id: string; status: PaymentStatus }) {
  const { id, ...updateData } = paymentData;
  const response = await apiFetch<ApiResponse<PaymentTransaction>>(`/payments/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  return response;
}

export function useUpdatePaymentStatusRQ(
  onSuccessFn: (response: any) => void,
  onErrorFn: (error: any) => void
) {
  return useMutation({
    mutationFn: (paymentData: { id: string; status: PaymentStatus }) =>
      updatePaymentStatus(paymentData),
    onSuccess: (data) => onSuccessFn(data),
    onError: (error) => onErrorFn(error),
  });
}

export async function getPaymentTransaction(transactionId: string) {
  const response = await apiFetch<ApiResponse<PaymentTransaction>>(`/payments/${transactionId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export function useGetPaymentTransactionRQ(transactionId: string) {
  return useQuery<ApiResponse<PaymentTransaction>>({
    queryFn: () => getPaymentTransaction(transactionId),
    queryKey: ["paymentTransaction", transactionId],
    enabled: !!transactionId,
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export async function getPaymentTransactions(queryParams?: PaymentQueryParams) {
  const searchParams = new URLSearchParams();
  
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }

  const queryString = searchParams.toString();
  const response = await apiFetch<ApiResponse<PaymentTransaction[]>>(`/payments${queryString ? `?${queryString}` : ""}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export function useGetPaymentTransactionsRQ(queryParams?: PaymentQueryParams) {
  const queryString = queryParams ? new URLSearchParams(
    Object.entries(queryParams).filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)])
  ).toString() : undefined;

  return useQuery<ApiResponse<PaymentTransaction[]>>({
    queryFn: () => getPaymentTransactions(queryParams),
    queryKey: ["paymentTransactions", queryString],
    staleTime: queryString ? 0 : 30_000,
    gcTime: 30 * 1000,
    refetchOnMount: queryString ? "always" : false,
  });
}

export async function getPaymentsByOrderId(orderId: string) {
  const response = await apiFetch<ApiResponse<PaymentTransaction[]>>(`/payments/order/${orderId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export function useGetPaymentsByOrderIdRQ(orderId: string) {
  return useQuery<ApiResponse<PaymentTransaction[]>>({
    queryFn: () => getPaymentsByOrderId(orderId),
    queryKey: ["paymentsByOrder", orderId],
    enabled: !!orderId,
    staleTime: 30_000,
    gcTime: 30 * 1000,
  });
}

export type {
  PaymentInitData,
  PaymentValidationData,
  PaymentTransaction,
  RefundData,
  PaymentQueryParams,
};