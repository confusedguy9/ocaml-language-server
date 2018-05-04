import { ChildProcess } from "child_process";
import Session from "../session";

export default class OcpIdent {
  public readonly process: ChildProcess;
  constructor(session: Session, args: string[] = []) {
    const command = "ocp-indent";

    const useWSL = session.settings.reason.command.useWSL;
    const shell = session.settings.reason.command.shell;
    const shellargs = session.settings.reason.command.shellargs;

    this.process = useWSL
      ? session.environment.spawn(shell, [...shellargs, command, ...args])
      : session.environment.spawn(command, args);
  }
}
