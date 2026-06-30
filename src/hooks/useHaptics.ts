import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { Capacitor } from '@capacitor/core'

const isNative = Capacitor.isNativePlatform()

export const haptics = {
  light: () => isNative && Haptics.impact({ style: ImpactStyle.Light }),
  medium: () => isNative && Haptics.impact({ style: ImpactStyle.Medium }),
  success: () => isNative && Haptics.notification({ type: NotificationType.Success }),
  warning: () => isNative && Haptics.notification({ type: NotificationType.Warning }),
}
