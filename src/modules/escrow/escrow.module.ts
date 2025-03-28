import { Module } from "@nestjs/common";
import { EscrowController } from "./escrow.controller";
import { EscrowService } from "./escrow.service";
import { StarknetModule } from "../starknet/starknet.module";

@Module({
    imports: [StarknetModule],
    controllers: [EscrowController],
    providers: [EscrowService],
    exports: [EscrowService],
})
export class EscrowModule {}
