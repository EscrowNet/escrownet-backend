import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Put,
    Delete,
    UseGuards,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { EscrowService } from "./escrow.service";
import { CreateEscrowDto } from "./dto/create-escrow.dto";
import { UpdateEscrowDto } from "./dto/update-escrow.dto";
import { AuthGuard } from "@nestjs/passport";
import { Escrow } from './entities/escrow.entity';

@Controller("escrow")
@UseGuards(AuthGuard("jwt"))
export class EscrowController {
    constructor(private readonly escrowService: EscrowService) {}

    @Post("create")
    @HttpCode(HttpStatus.CREATED)
    async createEscrow(@Body() createEscrowDto: CreateEscrowDto): Promise<Escrow> {
        return this.escrowService.createEscrow(createEscrowDto);
    }

    @Get(":id")
    async getEscrowById(@Param("id") id: string): Promise<Escrow> {
        return this.escrowService.getEscrowById(id);
    }

    @Get()
    async getEscrowHistory(): Promise<Escrow[]> {
        return this.escrowService.getEscrowHistory();
    }

    @Post(":id/release")
    async releaseEscrow(
        @Param("id") id: string,
        @Body("callerAddress") callerAddress: string,
    ): Promise<Escrow> {
        return this.escrowService.releaseEscrow(id, callerAddress);
    }

    @Post(":id/dispute")
    async disputeEscrow(
        @Param("id") id: string,
        @Body("callerAddress") callerAddress: string,
        @Body("reason") reason: string,
    ): Promise<Escrow> {
        return this.escrowService.disputeEscrow(id, callerAddress, reason);
    }

    @Put(":id")
    async updateEscrow(
        @Param("id") id: string,
        @Body() updateEscrowDto: UpdateEscrowDto
    ) {
        return this.escrowService.update(id, updateEscrowDto);
    }

    @Delete(":id")
    async deleteEscrow(@Param("id") id: string) {
        return this.escrowService.remove(id);
    }

    @Get("user/:userId")
    async getUserEscrows(@Param("userId") userId: string) {
        return this.escrowService.findByUser(userId);
    }
}
