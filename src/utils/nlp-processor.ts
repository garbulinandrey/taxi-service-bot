export class NLPProcessor {
    async normalize(text: string): Promise<string> {
        return text.toLowerCase().trim();
    }

    async tokenize(text: string): Promise<string[]> {
        return text.split(/\s+/).filter(token => token.length > 0);
    }
}