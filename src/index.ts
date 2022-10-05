import {Command} from '@oclif/command'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as helmet from 'helmet'
import * as session from 'express-session'
import {User} from './model/user'
import {LoginController} from './controller/login-controller'
import {Controller} from './controller/controller'
import {IndexController} from './controller/index-controller'
import {Git} from './git'
import {ObjectStorage} from './object-storage'
import {DetailsController} from './controller/details-controller'
import {TextUtils} from './utils/text-utils'
import {LocalCache} from './local-cache'

declare module 'express-session' {
  interface SessionData {
    logged: boolean;
  }
}

class VelinReleaseServer extends Command {
  private app!: express.Application;
  private readonly port = 7020;
  public basePath = '/';

  public user?: User;
  public git?: Git;
  public objectStorage?: ObjectStorage;
  public cache?: LocalCache;

  async run() {
    this.readUserFromEnv();

    this.initGit();
    this.initStorage();
    this.initCache();

    this.startExpressServer()
  }

  private readUserFromEnv() {
    if (process.env.BASE_PATH) {
      this.basePath = process.env.BASE_PATH;
    }

    this.user = {
      username: process.env.LOGIN_USER,
      password: process.env.LOGIN_PASS,
    };

    if (!this.user.username || !this.user.password) {
      throw new Error('Missing username or password');
    }
  }

  private initGit() {
    this.git = new Git();
    this.git.init();
  }

  private initStorage() {
    this.objectStorage = new ObjectStorage(this);
    this.objectStorage.init();
  }

  private initCache() {
    this.cache = new LocalCache(this);
    this.cache.init();
  }

  private startExpressServer() {
    this.app = express()

    this.app.set('view engine', 'pug')
    this.app.locals = {
      formatBytes: TextUtils.formatBytes,
      basePath: this.basePath,
    }

    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'img-src': ["'self'", 'data:', '*.prod.public.atl-paas.net'],
        },
      },
    }))

    this.app.use(bodyParser.urlencoded({
      extended: true,
    }))

    const secret = process.env.SESSION_SECRET
    if (!secret) {
      throw new Error('Session secret is missing');
    }

    const sessionOptions: session.SessionOptions = {
      secret: secret,
      resave: false,
      saveUninitialized: false,
      cookie: {},
    }

    if (this.app.get('env') !== 'development') {
      this.app.set('trust proxy', 1)
      sessionOptions.cookie!.secure = true
    }

    this.app.use(session(sessionOptions))

    const controllers: Controller[] = [
      new LoginController(this),
      new IndexController(this),
      new DetailsController(this),
    ];
    for (const controller of controllers) {
      controller.register(this.app);
    }

    this.app.use('/public', express.static('public'))
    this.app.listen(this.port, () => console.log(`velin-release-server listening on port ${this.port}!`))
  }
}

export = VelinReleaseServer
