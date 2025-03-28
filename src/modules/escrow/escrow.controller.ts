import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Put,
    Delete,
    UseGuards,
} from "@nestjs/common";
import { EscrowService } from "./escrow.service";
import { CreateEscrowDto } from "./dto/create-escrow.dto";
import { UpdateEscrowDto } from "./dto/update-escrow.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("escrow")
@UseGuards(AuthGuard("jwt"))
export class EscrowController {
    constructor(private readonly escrowService: EscrowService) {}

    @Post()
    async createEscrow(@Body() createEscrowDto: CreateEscrowDto) {
        return this.escrowService.create(createEscrowDto);
    }

    @Get(":id")
    async getEscrow(@Param("id") id: string) {
        return this.escrowService.findOne(id);
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
