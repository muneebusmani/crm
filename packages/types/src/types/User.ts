export enum UserType {
  ADMIN = 'admin',
  DEALER = 'dealer',
}
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  type: UserType;
};
