export interface ConfigService {
  get<T = string>(key: string, default_?: T): T
  getOrThrow<T = string>(key: string): T
}
