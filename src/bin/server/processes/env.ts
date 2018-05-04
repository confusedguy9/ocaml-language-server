import { ChildProcess } from "child_process";
import Session from "../session";

export default class Env {
  public readonly process: ChildProcess;
  constructor(session: Session) {
    const command = session.settings.reason.path.env;

    const useWSL = session.settings.reason.command.useWSL;
    const shell = session.settings.reason.command.shell;
    const shellargs = session.settings.reason.command.shellargs;

    this.process = useWSL
      ? session.environment.spawn(shell, [...shellargs, command])
      : session.environment.spawn(command, []);
  }
}
