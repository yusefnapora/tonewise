const iPhonePlatforms = ['iPhone Simulator', 'iPod Simulator', 'iPhone', 'iPod']

const iPadPlatforms = ['iPad Simulator', 'iPad']

const currentPlatform = () =>
  // @ts-expect-error
  navigator.userAgentData?.platform ?? navigator.platform

export const isIPad = () => {
  return (
    iPadPlatforms.includes(currentPlatform()) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  )
}

export const isIPhone = () => {
  return iPhonePlatforms.includes(currentPlatform())
}

export const isIOS = () => isIPad() || isIPhone()
