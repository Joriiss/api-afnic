export interface AfnicContactCreatePayload {
  email: string;
  telephoneNumber: string;
  localizedPostalInfo: {
    contactName: string;
    organizationName?: string;
    postalAddress: {
      firstStreet: string;
      secondStreet?: string;
      complementaryStreet?: string;
      cityName: string;
      postalCode?: string;
      countryCode: string;
    };
  };
  extensions: {
    frnic: {
      eligibilityVerified?: boolean;
      reachable?: {
        reachable: boolean;
        medium: 'VOICE' | 'EMAIL';
      };
      physical?: {
        firstName: string;
      };
      moral?: {
        legalStatus: 'COMPANY' | 'OTHER' | 'ASSOCIATION';
        sirenSiret?: string;
        otherLegalStatusName?: string;
      };
    };
  };
}

export interface AfnicContactCreateResponse {
  clientId?: string;
  creationDate?: string;
}
