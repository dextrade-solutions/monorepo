import { AdSetting } from './ad';

export type AuthParams = {
  mnemonicHash: string;
  publicKey: string;
  masterPublicKey: string;
  signature: string;

  deviceId?: string;
  deviceToken?: string;
};

export interface ExchangerInfoModel {
  id?: number;
  rating?: number;
  userId?: number;
}

export interface TotalRatingModel {
  positive?: number;
  negative?: number;
  totalRating?: number;
}

export interface UserModel {
  id?: number;
  name?: string;
  avatar?: string;
  active?: boolean;
  exchangerSettings?: AdSetting[];
  userInfo?: ExchangerInfoModel;
  startSocket?: boolean;
  hasExchanger?: boolean;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  rating?: TotalRatingModel;
  exchangeCount?: number;
  exchangeCompletionRate?: number;
}

export interface UserSessionModel {
  id?: number;
  userId?: number;
  sessionId?: string;
  name?: string;
  deviceId?: string;
  apiKey?: string;
  lastActive?: number;
  created?: number;
  status?: 'ACTIVE' | 'OFFLINE';
}
