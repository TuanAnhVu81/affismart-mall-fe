"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelOrder,
  createOrder,
  createPaymentSession,
  getMyOrderDetail,
  getMyOrders,
} from "@/services/order.service";
import type { CreateOrderPayload, GetMyOrdersParams } from "@/types/order.types";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
};

export const useCreatePaymentSession = () =>
  useMutation({
    mutationFn: (orderId: number) => createPaymentSession(orderId),
  });

export const useMyOrders = (params: GetMyOrdersParams = {}) =>
  useQuery({
    queryKey: ["my-orders", params],
    queryFn: () => getMyOrders(params),
  });

export const useMyOrderDetail = (orderId: number | null) =>
  useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: () => getMyOrderDetail(orderId as number),
    enabled: orderId !== null,
  });

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => cancelOrder(orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["order-detail"] });
    },
  });
};
