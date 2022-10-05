import {Controller} from './controller'
import * as express from 'express'
import {Request, Response} from 'express'

export class DetailsController extends Controller {

  register(app: express.Application): void {
    app.get('/details/:hash', this.detailsPage);
    app.post('/details/:hash/promote', this.promoteCommit);
  }

  public detailsPage = async (req: Request, res: Response) => {
    if (!req.session.logged) {
      this.redirect(res, 'login');
      return;
    }

    const commit = await this.app.git?.getCommit(req.params.hash);
    if (!commit) {
      res.render('details', {errorMessage: 'Commit not found'});
      return;
    }

    const objects = await this.app.objectStorage?.getObjectsForCommit('master', commit.hash!);
    const version = await this.app.objectStorage?.getVersionFromObjects(objects);
    const isPromoted = await this.app.cache?.getLastPromotedCommit() === commit.hash;

    res.render('details', {commit: commit, objects: objects,
      isPromoted: isPromoted, version: version});
  }

  public promoteCommit = async (req: Request, res: Response) => {
    if (!req.session.logged) {
      this.redirect(res, 'login');
      return;
    }

    const objects = await this.app.objectStorage?.getObjectsForCommit('master', req.params.hash);
    await this.app.objectStorage?.promoteRelease(objects);

    await this.app.cache?.storeLastPromotedCommit(req.params.hash);

    this.redirect(res, 'details/' + req.params.hash);
  }
}
