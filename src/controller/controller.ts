import * as express from 'express'
import {Response} from 'express'
import VelinReleaseServer = require('../index')

export abstract class Controller {
  protected app: VelinReleaseServer;

  constructor(app: VelinReleaseServer) {
    this.app = app
  }

  abstract register(app: express.Application): void;

  redirect(res: Response, url: string) {
    if (url === '/') {
      url = '';
    }

    res.redirect(this.app.basePath + url);
  }
}
