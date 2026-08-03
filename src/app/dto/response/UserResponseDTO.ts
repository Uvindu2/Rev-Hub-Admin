export interface UserResponseDTO {
  userId: number;
  username: string;
  fullName: string | null;
  role: any | null;
  active: boolean;
}
