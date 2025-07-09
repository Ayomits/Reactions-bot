import { Rest } from '../lib/rest';
import { AllReactionsResponse, OtakuReactionApiKeys, SingleReactionResponse } from './reaction.types';

export class OtakuReactionRest extends Rest {
  constructor() {
    super('https://api.otakugifs.xyz');
  }
}

export class OtakuReactionApi {
  private rest: OtakuReactionRest;

  constructor() {
    this.rest = new OtakuReactionRest();
  }

  public async getReaction(reaction: OtakuReactionApiKeys) {
    return await this.rest.get<SingleReactionResponse>(`/gif?reaction=${reaction}`)
  }

  public async getAllReactions() {
    return await this.rest.get<AllReactionsResponse>("/gif/allreactions")
  }
}
