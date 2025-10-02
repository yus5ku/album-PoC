export type AuthedUser = {
  id: string;
  provider: "line";
  providerId: string;
  name?: string;
  imageUrl?: string;
};
