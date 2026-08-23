export interface UserResponseDTO {
  userId: number;
  username: string;
  fullName: string | null;
  speciality: string | null;
  role: any | null;
  active: boolean;
}
