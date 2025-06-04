import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CreateEscrowDto } from "./dto/create-escrow.dto";
import { UpdateEscrowDto } from "./dto/update-escrow.dto";
import { StarknetService } from "../starknet/starknet.service";
import { Escrow, EscrowStatus } from './entities/escrow.entity';

@Injectable()
export class EscrowService {
    constructor(
        @InjectRepository(Escrow)
        private escrowRepository: Repository<Escrow>,
        @InjectQueue('escrow')
        private escrowQueue: Queue,
        private readonly starknetService: StarknetService
    ) {}

    async create(createEscrowDto: CreateEscrowDto) {
        const escrow = this.escrowRepository.create({
            ...createEscrowDto,
            status: EscrowStatus.PENDING,
        });

        const savedEscrow = await this.escrowRepository.save(escrow);

        // Create escrow contract on Starknet
        const contractAddress =
            await this.starknetService.createEscrowContract(createEscrowDto);
        escrow.contractAddress = contractAddress;

        // Queue the escrow creation process
        await this.escrowQueue.add('create', {
            escrowId: savedEscrow.id,
        });

        return savedEscrow;
    }

    async findOne(id: string) {
        const escrow = await this.escrowRepository.findOne({ where: { id } });
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

        return this.escrowRepository.save(updatedEscrow);
    }

    async remove(id: string) {
        const escrow = await this.findOne(id);
        await this.escrowRepository.remove(escrow);
        return { message: "Escrow deleted successfully" };
    }

    async findByUser(userId: string) {
        return await this.escrowRepository.find({
            where: [
                { sellerAddress: userId },
                { buyerAddress: userId }
            ],
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async releaseEscrow(id: string, callerAddress: string) {
        const escrow = await this.findOne(id);

        if (escrow.status !== EscrowStatus.ACTIVE) {
            throw new Error('Only active escrows can be released');
        }

        if (callerAddress !== escrow.buyerAddress) {
            throw new Error('Only the buyer can release the escrow');
        }

        // Queue the release process
        await this.escrowQueue.add('release', {
            escrowId: id,
            callerAddress,
        });

        return escrow;
    }

    async disputeEscrow(
        id: string,
        callerAddress: string,
        reason: string,
    ) {
        const escrow = await this.findOne(id);

        if (escrow.status !== EscrowStatus.ACTIVE) {
            throw new Error('Only active escrows can be disputed');
        }

        if (![escrow.buyerAddress, escrow.sellerAddress].includes(callerAddress)) {
            throw new Error('Only buyer or seller can dispute the escrow');
        }

        // Queue the dispute process
        await this.escrowQueue.add('dispute', {
            escrowId: id,
            callerAddress,
            reason,
        });

        return escrow;
    }

    async getEscrowHistory() {
        return await this.escrowRepository.find({
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async verifyEscrowConditions(escrow: Escrow) {
        if (!escrow.releaseConditions) {
            return true;
        }

        // Implement your condition verification logic here
        // This is a placeholder for the actual implementation
        return true;
    }
}
