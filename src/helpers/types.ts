export type PopulatedAccount = {
  address: string;
  balance: string;
  source: "ganache" | "metamask";
};

export type SubmitSecretPayloadDTO = [string, string, string, number];

export interface SecretDT {
  id: number;
  title: string;
  price: string;
}

export interface SecretDetailsDT extends SecretDT {
  owner?: string;
  description?: string;
  content?: string;
}
