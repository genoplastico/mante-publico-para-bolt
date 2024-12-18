export interface DeleteUserResult {
  success: boolean;
  message: string;
  authDeleted?: boolean;
}

export interface DeleteUserParams {
  userId: string;
}