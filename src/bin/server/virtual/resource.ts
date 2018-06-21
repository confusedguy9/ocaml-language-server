import URI from "vscode-uri";
import { Host, wslPath2Win } from "./host";

export class Resource {
  public static from(source: Host, uri: URI): Resource {
    return new this(source, uri);
  }
  protected constructor(readonly source: Host, readonly uri: URI) {}
  public into(target: Host, skipEncoding: boolean = true): URI {
    switch (target) {
      case Host.Native:
        return this.readNative(skipEncoding);
      case Host.WSL:
        return this.readWSL(skipEncoding);
    }
  }
  protected readNative(skipEncoding: boolean): URI {
    switch (this.source) {
      case Host.Native:
        return this.uri;
      case Host.WSL:
        const uri = this.uri.toString(skipEncoding);
        const uriWin = wslPath2Win(uri);
        if (uri !== uriWin) {
          return URI.parse(uriWin);
        }
        throw new Error("unreachable");
    }
  }
  protected readWSL(skipEncoding: boolean): URI {
    switch (this.source) {
      case Host.Native:
        const uri = this.uri.toString(skipEncoding);
        let match: RegExpMatchArray | null = null;
        if (null != (match = uri.match(/^file:\/\/\/([a-zA-Z]):(.*)$/))) {
          match.shift();
          const drive = match.shift() as string;
          const rest = match.shift() as string;
          return URI.parse(`file:///mnt/${drive}${rest}`);
        }
        throw new Error("unreachable");
      case Host.WSL:
        return this.uri;
    }
  }
}
