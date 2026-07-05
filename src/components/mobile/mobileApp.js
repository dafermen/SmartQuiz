import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

export const configureNativeMobileApp = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: "#ffffff" });
    await Keyboard.setResizeMode({ mode: "body" });
    await SplashScreen.hide();
  } catch {
    // Native plugins are best-effort so web preview remains unaffected.
  }
};
