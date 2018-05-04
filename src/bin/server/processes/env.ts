import { ChildProcess } from "child_process";
import Session from "../session";

export default class Env {
  public readonly process: ChildProcess;
  constructor(session: Session) {
    // const command = session.settings.reason.path.env;
    const command = "bash";
    this.process = session.environment.spawn(command, ["-ic", "env"]);
  }
}
