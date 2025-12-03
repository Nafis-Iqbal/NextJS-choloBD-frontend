import {z} from "zod";

export const updateNotificationStatusSchema = z.object({
    orderStatus: z.boolean()
}).strict()