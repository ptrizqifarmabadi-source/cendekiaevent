export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export type ActivityType = 'internal' | 'external';

export type Division = 'Akademik' | 'Asrama' | 'Operasional';

export type Category = string;

export interface Activity {
  id?: string;
  name: string;
  date: any; // Firestore Timestamp (Start)
  endDate: any; // Firestore Timestamp (End)
  division: Division;
  pic: string;
  type: ActivityType;
  participantCount: number;
  participantOrigin: string;
  categories: Category[];
  budget: number;
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  updatedAt: any;
}
