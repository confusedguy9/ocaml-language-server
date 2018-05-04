import { ChildProcess } from "child_process";
import Session from "../session";

export default class OcpIdent {
  public readonly process: ChildProcess;
  constructor(session: Session, args: string[] = []) {
    // const command = "ocp-indent";
    const command = "bash";
    const args1 = ["-ic", "ocp-indent", ...args];
    this.process = session.environment.spawn(command, args1);
  }
}
