import VelinReleaseServer = require('./index')
import {Tedis} from 'tedis';

export class LocalCache {
  private app: VelinReleaseServer;
  private readonly host?: string;
  private readonly port?: string;

  private readonly lastPromoteKey = 'releaseVersion/lastPromotedCommit';

  private tedis?: Tedis;

  constructor(app: VelinReleaseServer) {
    this.app = app

    this.host = process.env.REDIS_HOST;
    this.port = process.env.REDIS_PORT;

    if (!this.host || !this.port) {
      throw new Error('Invalid Redis configuration')
    }
  }

  init() {
    this.tedis = new Tedis({
      port: Number.parseInt(this.port!, 10),
      host: this.host,
    });
  }

  async storeLastPromotedCommit(hash: string) {
    await this.tedis!.set(this.lastPromoteKey, hash);
  }

  async getLastPromotedCommit(): Promise<string | undefined> {
    const value = await this.tedis?.get(this.lastPromoteKey);
    if (value) {
      return value as string;
    }
    return undefined;
  }
}
