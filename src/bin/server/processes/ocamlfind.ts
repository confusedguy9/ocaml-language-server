import { ChildProcess } from "child_process";
import Session from "../session";

export default class Ocamlfind {
  public readonly process: ChildProcess;
  constructor(session: Session, argsOpt?: string[]) {
    // const command = session.settings.reason.path.ocamlfind;
    const command = "bash";
    const args = argsOpt || ["list"];
    const args1 = ["-ic", "ocamlfind", ...args];
    this.process = session.environment.spawn(command, args1);
  }
}
