import { ObjectKeys } from "./object-keys";

export type LiteralEnum<T> = T[ObjectKeys<T>]
