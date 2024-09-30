import browser from 'webextension-polyfill';
import { isPwa } from '../constants/environment';

export const isManifestV3 =
  !isPwa && browser.runtime.getManifest().manifest_version === 3;
