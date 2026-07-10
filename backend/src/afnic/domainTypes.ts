export interface AfnicDomainCreatePayload {
  name: string;
  authorizationInformation: string;
  registrantClientId: string;
  durationInYears: number;
  contacts: Array<{
    clientId: string;
    role: 'ADMINISTRATIVE' | 'TECHNICAL';
  }>;
  nameServers?: string[];
}

export interface AfnicDomainCreateResponse {
  name?: string;
  creationDate?: string;
  expirationDate?: string;
}
