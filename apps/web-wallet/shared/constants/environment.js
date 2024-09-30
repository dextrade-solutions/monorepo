export const isMain = process.env.METAMASK_BUILD_TYPE === 'main';
export const isFlask = process.env.METAMASK_BUILD_TYPE === 'flask';
export const isDevBuild = process.env.NODE_ENV === 'development';
export const isPwa = Boolean(process.env.IS_PWA);
export const testnetModeInitial = Boolean(process.env.TESTNET_MODE_INITIAL);
