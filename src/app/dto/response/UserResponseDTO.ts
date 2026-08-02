export interface UserResponseDTO {
  userId: number;
  username: string;
  fullName: string | null;
  role: string | null;
  active: boolean;
}
