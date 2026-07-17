import { z } from "zod";
import { withNullsStripped } from "./schemaUtils";

export const updateNotificationStatusSchema = withNullsStripped(z.object({
    orderStatus: z.boolean()
}).strict());
