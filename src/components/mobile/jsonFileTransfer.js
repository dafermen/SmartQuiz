import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const downloadJsonInBrowser = (payload, filename) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportJsonFile = async (payload, filename, title = "SmartQuiz backup") => {
  if (!Capacitor.isNativePlatform()) {
    downloadJsonInBrowser(payload, filename);
    return { method: "download" };
  }

  const savedFile = await Filesystem.writeFile({
    path: filename,
    data: JSON.stringify(payload, null, 2),
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
    recursive: true
  });

  await Share.share({
    title,
    text: title,
    url: savedFile.uri,
    dialogTitle: title
  });

  return { method: "share", uri: savedFile.uri };
};
