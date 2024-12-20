import { idSchema } from "@Spark-It/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

export const deleteResumeSchema = z.object({
  id: idSchema,
});

export class DeleteResumeDto extends createZodDto(deleteResumeSchema) {}
