import {RoleNameResponseDTO} from './RoleNameResponseDTO';

export interface UserTableViewResponseDTO {
  userId: number;
  username: string;
  fullName: string | null;
  speciality: string | null;
  role: RoleNameResponseDTO[];
  active: boolean;
}
