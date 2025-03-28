import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EscrowModule } from "./modules/escrow/escrow.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        EscrowModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
