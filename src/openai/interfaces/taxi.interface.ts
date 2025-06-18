export interface TaxiRequest {
  userId: string;
  messageText: string;
  context?: TaxiContext;
}

export interface TaxiContext {
  previousIntent?: string;
  confirmedAddresses?: {
    pickup?: string;
    destination?: string;
  };
  requirements?: string[];
  stage?: 'initial' | 'address_confirmation' | 'requirements' | 'confirmation';
}

export interface TaxiResponse {
  intent: 'booking' | 'price_estimate' | 'cancel' | 'status';
  addresses: {
    pickup?: string;
    destination?: string;
  };
  requirements: string[];
  response: string;
}