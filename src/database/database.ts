export class Database {
    private collections: Map<string, any[]>;

    constructor() {
        this.collections = new Map();
    }

    collection(name: string) {
        if (!this.collections.has(name)) {
            this.collections.set(name, []);
        }

        return {
            insertOne: async (doc: any) => {
                const collection = this.collections.get(name) || [];
                collection.push(doc);
                this.collections.set(name, collection);
                return doc;
            },
            find: (query: any) => {
                const collection = this.collections.get(name) || [];
                return {
                    sort: (sortQuery: any) => ({
                        limit: (limit: number) => ({
                            toArray: async () => collection.slice(0, limit)
                        })
                    })
                };
            }
        };
    }
}