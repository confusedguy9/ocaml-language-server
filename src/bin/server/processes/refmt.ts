import { ChildProcess } from "child_process";
import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";

export default class ReFMT {
  public readonly process: ChildProcess;
  constructor(session: Session, id?: LSP.TextDocumentIdentifier, argsOpt?: string[]) {
    const uri = id ? id.uri : ".re";
    const command = session.settings.reason.path.refmt;

    const useWSL = session.settings.reason.command.useWSL;
    const shell = session.settings.reason.command.shell;
    const shellargs = session.settings.reason.command.shellargs;

    const width = session.settings.reason.format.width;
    const widthArg = width === null ? [] : ["--print-width", `${width}`];

    const args = argsOpt || ["--parse", "re", "--print", "re", "--interface", `${/\.rei$/.test(uri)}`].concat(widthArg);
    // const uri1 = uri.replace(/^file:\/\/\/(\w)(?:\%3A|\:)/, "/mnt/$1");
    this.process = useWSL
      ? session.environment.spawn(shell, [...shellargs, command, ...args])
      : session.environment.spawn(command, args);
  }
}
