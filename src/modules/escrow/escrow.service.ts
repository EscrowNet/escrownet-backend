import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateEscrowDto } from "./dto/create-escrow.dto";
import { UpdateEscrowDto } from "./dto/update-escrow.dto";
import { StarknetService } from "../starknet/starknet.service";

@Injectable()
export class EscrowService {
    private escrows: Map<string, any> = new Map();

    constructor(private readonly starknetService: StarknetService) {}

    async create(createEscrowDto: CreateEscrowDto) {
        const escrow = {
            id: Date.now().toString(),
            ...createEscrowDto,
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Create escrow contract on Starknet
        const contractAddress =
            await this.starknetService.createEscrowContract(createEscrowDto);
        escrow.contractAddress = contractAddress;

        this.escrows.set(escrow.id, escrow);
        return escrow;
    }

    async findOne(id: string) {
        const escrow = this.escrows.get(id);
        if (!escrow) {
            throw new NotFoundException(`Escrow with ID ${id} not found`);
        }
        return escrow;
    }

    async update(id: string, updateEscrowDto: UpdateEscrowDto) {
        const escrow = await this.findOne(id);
        const updatedEscrow = {
            ...escrow,
            ...updateEscrowDto,
            updatedAt: new Date(),
        };

        this.escrows.set(id, updatedEscrow);
        return updatedEscrow;
    }

    async remove(id: string) {
        const escrow = await this.findOne(id);
        this.escrows.delete(id);
        return { message: "Escrow deleted successfully" };
    }

    async findByUser(userId: string) {
        return Array.from(this.escrows.values()).filter(
            (escrow) =>
                escrow.sellerAddress === userId ||
                escrow.buyerAddress === userId
        );
    }
}
