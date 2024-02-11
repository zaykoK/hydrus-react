//Point of this is to serve as middleman between session/localStorage and App
//It should load necessary stuff from session/LocalStorage
//Keep it's own state and update on-disk entries
//This should make all these calls much faster (most noticable when needed for a lot of calls)

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