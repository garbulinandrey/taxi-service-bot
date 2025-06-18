export interface TaxiResponse {
    intent: 'booking' | 'price_estimate' | 'cancel' | 'status';
    addresses: {
        pickup: string;
        destination: string;
    };
    requirements: string[];
    response: string;
}