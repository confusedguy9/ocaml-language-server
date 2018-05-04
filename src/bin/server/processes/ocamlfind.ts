import { ChildProcess } from "child_process";
import Session from "../session";

export default class Ocamlfind {
  public readonly process: ChildProcess;
  constructor(session: Session, argsOpt?: string[]) {
    const command = session.settings.reason.path.ocamlfind;

    const useWSL = session.settings.reason.command.useWSL;
    const shell = session.settings.reason.command.shell;
    const shellargs = session.settings.reason.command.shellargs;

    const args = argsOpt || ["list"];

    this.process = useWSL
      ? session.environment.spawn(shell, [...shellargs, command, ...args])
      : session.environment.spawn(command, args);
  }
}
