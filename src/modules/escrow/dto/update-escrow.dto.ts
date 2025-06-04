import { PartialType } from "@nestjs/mapped-types";
import { CreateEscrowDto } from "./create-escrow.dto";

export class UpdateEscrowDto extends PartialType(CreateEscrowDto) {}
