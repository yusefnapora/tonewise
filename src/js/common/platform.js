const iPhonePlatforms = ['iPhone Simulator', 'iPod Simulator', 'iPhone', 'iPod']

const iPadPlatforms = ['iPad Simulator', 'iPad']

const currentPlatform = () =>
  // @ts-expect-error
  navigator.userAgentData?.platform ?? navigator.platform

export const isIPad = () => {
  return iPadPlatforms.includes(currentPlatform())
}

export const isIPhone = () => {
  return iPhonePlatforms.includes(currentPlatform())
}

export const isIOS = () => isIPad() || isIPhone()

// @ts-expect-error process is defined in rollup & not visible to typescript
export const isProd = process.env.NODE_ENV === 'production'
