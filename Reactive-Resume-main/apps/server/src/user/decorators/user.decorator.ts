import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserWithSecrets } from "@Spark-It/dto";

export const User = createParamDecorator(
  (data: keyof UserWithSecrets | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserWithSecrets;

    return data ? user[data] : user;
  },
);
