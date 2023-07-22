class LocalSessionStorage {
    static instance: LocalSessionStorage | null = null
    apiKey: string = ''
    constructor() {
        if (LocalSessionStorage.instance) {
            return LocalSessionStorage.instance
        }
        LocalSessionStorage.instance = this
    }
    setApiKey(key: string) {
        this.apiKey = key
    }
    getApiKey() {
        return this.apiKey
    }
}

export default LocalSessionStorage