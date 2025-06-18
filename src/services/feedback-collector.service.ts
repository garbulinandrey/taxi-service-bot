export interface Interaction {
    messageId: string;
    message: string;
    response: string;
    intent: string;
    timestamp: Date;
    wasHelpful?: boolean;
}

export class FeedbackCollector {
    private interactions: Map<string, Interaction>;

    constructor() {
        this.interactions = new Map();
    }

    async collectImplicitFeedback(message: string, response: string, intent: string): Promise<string> {
        const messageId = Date.now().toString(); // Простой генератор ID
        this.interactions.set(messageId, {
            messageId,
            message,
            response,
            intent,
            timestamp: new Date()
        });
        console.log('Collected implicit feedback:', { message, intent });
        return messageId;
    }

    async collectExplicitFeedback(messageId: string, wasHelpful: boolean) {
        const interaction = this.interactions.get(messageId);
        if (interaction) {
            interaction.wasHelpful = wasHelpful;
            this.interactions.set(messageId, interaction);
        }
        console.log('Collected explicit feedback:', { messageId, wasHelpful });
    }

    async getInteraction(messageId: string): Promise<Interaction | undefined> {
        return this.interactions.get(messageId);
    }

    async getAllInteractions(): Promise<Interaction[]> {
        return Array.from(this.interactions.values());
    }
}