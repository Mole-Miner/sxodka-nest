import { AbilityFactory } from './ability.factory';
import { Module } from '@nestjs/common';

@Module({
    providers: [AbilityFactory],
    exports: [AbilityFactory]
})
export class AbilityModule { }
