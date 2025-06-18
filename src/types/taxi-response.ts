export interface TaxiResponse {
    intent: 'service' | 'car_question' | 'dtp' | 'sick_leave' | 'fine_check' | 'long_distance' | 'other';
    response: string;
}