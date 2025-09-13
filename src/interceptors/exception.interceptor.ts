import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
    private readonly logger = new Logger(ExceptionInterceptor.name);

    intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError((error: Error) => {
                this.logger.error(error.message, error.stack);
                return throwError(() => error);
            }),
        );
    }
}
