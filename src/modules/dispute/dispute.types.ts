export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'ARBITRATOR_ASSIGNED'
  | 'EVIDENCE_COLLECTION'
  | 'ARBITRATION'
  | 'RESOLVED'
  | 'CLOSED';

export type DisputeResolution =
  | 'REFUND_BUYER'
  | 'RELEASE_SELLER'
  | 'PARTIAL_REFUND'
  | 'ESCALATE'
  | 'CANCEL';

export type EvidenceType = 'FILE' | 'NOTE' | 'LINK' | 'TRANSACTION';

export interface Dispute {
  id: string;
  escrowId: string;
  status: DisputeStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  assignedTo?: string;
  title: string;
  description: string;
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  resolutionDate?: Date;
  evidence: Evidence[];
  timeline: DisputeTimelineEvent[];
}

export interface Evidence {
  id: string;
  disputeId: string;
  type: EvidenceType;
  title: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  uploadedBy: string;
  uploadedAt: Date;
  verified: boolean;
}

export interface DisputeTimelineEvent {
  id: string;
  disputeId: string;
  type: 'STATUS_CHANGE' | 'EVIDENCE_ADDED' | 'ARBITRATOR_ASSIGNED' | 'RESOLUTION';
  description: string;
  performedBy: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Arbitrator {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialization: string[];
  activeCases: number;
  totalResolved: number;
  rating: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  assignedDisputes: string[];
}

export interface DisputeFilters {
  status?: DisputeStatus;
  createdBy?: string;
  assignedTo?: string;
  startDate?: Date;
  endDate?: Date;
  resolution?: DisputeResolution;
}

export interface DisputePagination {
  page: number;
  limit: number;
}

export interface DisputeResolutionRequest {
  resolution: DisputeResolution;
  notes: string;
  evidenceIds?: string[];
} 