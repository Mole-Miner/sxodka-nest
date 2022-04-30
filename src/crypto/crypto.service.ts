import { from, Observable, catchError, throwError } from 'rxjs';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { compare, hash, genSalt } from 'bcrypt';

@Injectable()
export class CryptoService {
    genSalt(rounds?: number): Observable<string> {
        return from(genSalt(rounds ?? 10)).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }

    compare(data: string | Buffer, encrypted: string): Observable<boolean> {
        return from(compare(data, encrypted)).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }

    hash(data: string | Buffer, saltOrRounds: string | number): Observable<string> {
        return from(hash(data, saltOrRounds)).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }
}