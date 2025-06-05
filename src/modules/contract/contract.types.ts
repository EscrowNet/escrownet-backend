export type ContractStatus = 'DEPLOYED' | 'PENDING' | 'FAILED' | 'VERIFIED';
export type ContractType = 'ESCROW' | 'TOKEN' | 'GOVERNANCE' | 'OTHER';
export type ContractNetwork = 'MAINNET' | 'TESTNET' | 'LOCAL';

export interface Contract {
  id: string;
  name: string;
  type: ContractType;
  network: ContractNetwork;
  address: string;
  status: ContractStatus;
  version: string;
  abi: any; // Starknet ABI
  bytecode?: string;
  deployedAt?: Date;
  verifiedAt?: Date;
  deployer: string;
  metadata: {
    description?: string;
    tags?: string[];
    sourceCode?: string;
    compilerVersion?: string;
    constructorArgs?: any[];
    [key: string]: any;
  };
  events: ContractEvent[];
  methods: ContractMethod[];
}

export interface ContractEvent {
  name: string;
  signature: string;
  inputs: {
    name: string;
    type: string;
    indexed?: boolean;
  }[];
  anonymous?: boolean;
}

export interface ContractMethod {
  name: string;
  type: 'function' | 'view' | 'external';
  inputs: {
    name: string;
    type: string;
  }[];
  outputs: {
    name: string;
    type: string;
  }[];
  stateMutability?: 'view' | 'external';
}

export interface ContractDeployment {
  contractId: string;
  network: ContractNetwork;
  constructorArgs?: any[];
  salt?: string;
  metadata?: Record<string, any>;
}

export interface ContractInteraction {
  contractId: string;
  method: string;
  args: any[];
  value?: string;
  metadata?: Record<string, any>;
}

export interface ContractEventFilter {
  contractId: string;
  eventName?: string;
  fromBlock?: number;
  toBlock?: number;
  indexedFilters?: Record<string, any>;
}

export interface ContractVerification {
  contractId: string;
  sourceCode: string;
  compilerVersion: string;
  constructorArgs?: any[];
  metadata?: Record<string, any>;
}

export interface ContractFilters {
  type?: ContractType;
  network?: ContractNetwork;
  status?: ContractStatus;
  deployer?: string;
  version?: string;
  tags?: string[];
}

export interface ContractPagination {
  page: number;
  limit: number;
}

export interface ContractEventLog {
  id: string;
  contractId: string;
  eventName: string;
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  logIndex: number;
  data: Record<string, any>;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ContractDeploymentResult {
  contractId: string;
  address: string;
  transactionHash: string;
  blockNumber: number;
  status: ContractStatus;
  error?: string;
}

export interface ContractInteractionResult {
  transactionHash: string;
  blockNumber: number;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
  events?: ContractEventLog[];
  returnValue?: any;
} 