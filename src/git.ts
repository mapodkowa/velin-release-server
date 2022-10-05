import {APIClient, Bitbucket, Schema} from 'bitbucket'
import {Options} from 'bitbucket/lib/bitbucket'
import Account = Schema.Account
import Repository = Schema.Repository
import BaseCommit = Schema.BaseCommit

export class Git {
  private readonly bitbucketUser?: string;
  private readonly bitbucketPass?: string;
  private readonly repoSlug?: string;
  private readonly workspace?: string;

  private bitbucket!: APIClient;
  private user?: Account;
  private repository?: Repository;

  constructor() {
    this.bitbucketUser = process.env.BITBUCKET_USER
    this.bitbucketPass = process.env.BITBUCKET_PASS

    const repo = process.env.BITBUCKET_REPO;
    if (repo) {
      const args = repo.split('/');
      this.workspace = args[0];
      this.repoSlug = args[1];
    } else {
      throw new Error('Missing Bitbucket repo')
    }

    if (!this.bitbucketUser || !this.bitbucketPass) {
      throw new Error('Missing Bitbucket user or pass')
    }
  }

  public init() {
    const clientOptions: Options = {
      auth: {
        username: this.bitbucketUser!,
        password: this.bitbucketPass!,
      },
    };

    this.bitbucket = new Bitbucket(clientOptions);

    this.bitbucket.user.get({}).then(value => {
      this.user = value.data;
      console.log('Logged in to Bitbucket as ' + value.data.username);

      this.loadRepository();
    });
  }

  private loadRepository() {
    if (!this.workspace || !this.repoSlug) {
      return;
    }

    const params = {workspace: this.workspace, repo_slug: this.repoSlug};

    this.bitbucket.repositories.get(params).then(value => {
      this.repository = value.data;
      console.log('Loaded repository: ' + value.data.full_name);
    });
  }

  public async getCommits(): Promise<BaseCommit[] | undefined> {
    const params = {workspace: this.workspace!, repo_slug: this.repoSlug!, include: 'master'};
    const value = await this.bitbucket.commits.list(params);
    return value.data.values;
  }

  public async getCommit(hash: string): Promise<BaseCommit | undefined> {
    const params = {workspace: this.workspace!, repo_slug: this.repoSlug!, commit: hash};
    const value = await this.bitbucket.commits.get(params);
    return value.data;
  }

}
