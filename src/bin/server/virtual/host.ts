import URI from "vscode-uri";

export enum Host {
  Native = "native",
  WSL = "wsl",
}

export function wslPath2Win(uri: string): string {
  // FIXME: move this check somewhere earlier and do it only once
  const wslhomeFile = process.env.wslhome;
  if (null == wslhomeFile) throw new Error("WSLHOME must be set in environment to interpret WSL /home");
  // FIXME: compute localappdata earlier and do it only once
  const wslhome = URI.file(wslhomeFile).toString(true);
  let match: RegExpMatchArray | null = null;
  // rewrite /mnt/…
  if (null != (match = uri.match(/^file:\/\/\/mnt\/([a-zA-Z])\/(.*)$/))) {
    match.shift();
    const drive = match.shift() as string;
    const rest = match.shift() as string;
    return `file:///${drive}:/${rest}`;
  }
  // rewrite /home/…
  if (null != (match = uri.match(/^file:\/\/\/home\/(.+)$/))) {
    match.shift();
    const rest = match.shift() as string;
    return `${wslhome}/${rest}`;
  }
  return uri;
}