import VelinReleaseServer = require('./index')
import * as AWS from 'aws-sdk';
import {S3} from 'aws-sdk'
import {Object} from 'aws-sdk/clients/s3'
import {AppVersion} from './model/app-version'

export class ObjectStorage {
  private app: VelinReleaseServer;

  private bucket?: string;
  private s3?: S3;

  constructor(app: VelinReleaseServer) {
    this.app = app
  }

  public init() {
    const accessKey = process.env.S3_ACCESSKEY;
    const secretKey = process.env.S3_SECRETKEY;
    this.bucket = process.env.S3_BUCKET;

    if (!accessKey || !secretKey || !this.bucket) {
      throw new Error('S3 missing configuration');
    }

    this.s3 = new AWS.S3({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      endpoint: 'https://s3.fsrv.ovh/',
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
  }

  public async getObjectsForCommit(branch: string, hash: string): Promise<S3.ObjectList | undefined> {
    const value = await this.s3?.listObjects({Bucket: this.bucket!,
      Prefix: 'snapshot/' + branch + '/' + hash + '/'}).promise();

    if (!value) {
      return undefined;
    }

    return value.Contents;
  }

  public async promoteRelease(objects: S3.ObjectList | undefined) {
    if (!objects) {
      return;
    }

    for (const object of objects) {
      if (!object.Key) continue;

      const args = object.Key.split('/');
      let filename = args[args.length - 1];
      if (filename === 'version.properties') {
        filename = 'version';
      }
      const key = 'latest/' + filename;

      await this.s3?.copyObject({Bucket: this.bucket!, Key: key, CopySource: this.bucket! + '/' + object.Key}).promise();
    }
  }

  public async getVersionFromObjects(objects: S3.ObjectList | undefined): Promise<AppVersion | undefined> {
    // eslint-disable-next-line @typescript-eslint/ban-types
    let object: Object | undefined;

    if (!objects) {
      return undefined;
    }

    for (const o of objects) {
      if (o.Key?.endsWith('.properties')) {
        object = o;
        break;
      }
    }

    if (!object) {
      return undefined;
    }

    const data = await this.s3?.getObject({Bucket: this.bucket!, Key: object.Key!}).promise();
    const text = data!.Body!.toString();

    const lines = text.split(/\r?\n/);
    let versionCode: number | undefined;
    let versionName: string | undefined;

    for (const line of lines) {
      if (line.startsWith('VERSION_CODE=')) {
        versionCode = Number.parseInt(line.split('=')[1], 10)
      } else if (line.startsWith('VERSION_NAME=')) {
        versionName = line.split('=')[1];
      }
    }

    if (!versionCode || !versionName) {
      return undefined;
    }

    return {
      code: versionCode,
      name: versionName,
    }
  }
}
