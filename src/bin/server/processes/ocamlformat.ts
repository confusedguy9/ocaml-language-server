import { ChildProcess } from "child_process";
import Session from "../session";

export default class Ocamlformat {
  public readonly process: ChildProcess;
  constructor(session: Session, args: string[] = []) {
    const command = "ocamlformat";

    const useWSL = session.settings.reason.command.useWSL;
    const shell = session.settings.reason.command.shell;
    const shellargs = session.settings.reason.command.shellargs;
    const commandline = `"${[command, ...args].join(" ")}"`;

    this.process = useWSL
      ? session.environment.spawn(shell, [...shellargs, commandline])
      : session.environment.spawn(command, args);
  }
}
