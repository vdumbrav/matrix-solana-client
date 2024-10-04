import { MagicUserMetadata } from 'magic-sdk';

export interface OAuthUserInfo {
  sub: string;
  name: string;
  familyName: string;
  givenName: string;
  picture: string;
  email: string;
  emailVerified: boolean;
}

export interface OAuthResult {
  oauth: {
    provider: string;
    scope: string[];
    accessToken: string;
    userHandle: string;
    userInfo: OAuthUserInfo;
  };
  magic: {
    idToken: string;
    userMetadata: MagicUserMetadata;
  };
}
