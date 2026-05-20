import { z } from "zod";

// TODO エラーメッセージカスタム
export const createOrderSchema =
  z.object({
    orderNumber: z
      .string()
      .min(1),

    customerId: z.number(),

    createdById: z.number(),

    orderTitle: z
      .string()
      .min(1),

    notes: z.string(),
  });

export const updateOrderStatusSchema =
  z.object({
    status: z.enum([
      "pending_assignment",
      "assigned",
      "in_progress",
      "completed",
    ]),
    changedById: z.number(),
  });

export const reassignOrderSchema =
  z.object({
    newUserId: z.number(),
    changedById: z.number(),
  });