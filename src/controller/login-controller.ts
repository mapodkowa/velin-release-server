import {Request, Response} from 'express'
import * as express from 'express'
import {Controller} from './controller'

export class LoginController extends Controller {

  public register(app: express.Application) {
    app.get('/login', this.loginPage);
    app.post('/login', this.loginPost);
    app.post('/logout', this.logout);
  }

  public loginPage = async (req: Request, res: Response) => {
    res.render('login');
  }

  public loginPost = async (req: Request, res: Response) => {
    if (req.body.username === this.app.user?.username &&
        req.body.password === this.app.user?.password) {
      req.session.logged = true;
      this.redirect(res, '/');
    } else {
      res.render('login', {errorMessage: 'Invalid username or password'});
    }
  }

  public logout = async (req: Request, res: Response) => {
    req.session.destroy(err => console.error(err));
    this.redirect(res, 'login');
  }
}
