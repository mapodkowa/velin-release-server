import {Controller} from './controller'
import * as express from 'express'
import {Request, Response} from 'express'

export class IndexController extends Controller {

  register(app: express.Application): void {
    app.get('/', this.index)
  }

  public index = async (req: Request, res: Response) => {
    if (!req.session.logged) {
      this.redirect(res, 'login')
      return
    }

    let commits
    let errorMessage
    try {
      commits = await this.app.git?.getCommits()
    } catch (error) {
      commits = []
      errorMessage = 'Cannot load commits from Bitbucket'
    }

    const lastPromotedCommit = await this.app.cache?.getLastPromotedCommit();

    res.render('index', {commits: commits, lastPromotedCommit: lastPromotedCommit, errorMessage: errorMessage})
  }
}
