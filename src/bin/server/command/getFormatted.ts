import * as fs from "fs";
import * as tmp from "tmp";
import * as LSP from "vscode-languageserver-protocol";
import { refmt as refmtParser } from "../parser";
import * as processes from "../processes";
import Session from "../session";

export async function ocamlformat(session: Session, doc: LSP.TextDocument): Promise<string> {
  const text = doc.getText();
  const [fd, path] = await new Promise<[number, string]>(resolve => {
    tmp.file((err: any, path: string, fd: number, _1) => {
      if (err) throw err;
      resolve([fd, path]);
    });
  });
  await new Promise<void>(resolve => {
    fs.write(fd, text, (err: NodeJS.ErrnoException) => {
      if (err) throw err;
      resolve();
    });
  });
  const useWSL = session.settings.reason.command.useWSL;
  let realPath: string = path;
  if (useWSL) {
    const match: RegExpMatchArray | null = path.match(/^([A-Z]):(.*)$/);
    if (null == match) {
      return Promise.reject();
    } else {
      match.shift();
      const drive = match.shift() as string;
      const rest = match.shift() as string;
      realPath = `/mnt/${drive.toLowerCase()}/${rest.replace(/\\/g, "/")}`;
    }
  }
  const ocamlFormat = new processes.Ocamlformat(session, [realPath]).process;
  const otxt = await new Promise<string>((resolve, reject) => {
    let buffer = "";
    ocamlFormat.stdout.on("error", (error: Error) => reject(error));
    ocamlFormat.stdout.on("data", (data: Buffer | string) => (buffer += data.toString()));
    ocamlFormat.stdout.on("end", () => resolve(buffer));
  });
  ocamlFormat.unref();
  return otxt;
}

export async function ocpIndent(session: Session, doc: LSP.TextDocument, range?: LSP.Range): Promise<string> {
  const text = doc.getText();
  const args: string[] = null != range ? [`--lines=${range.start.line + 1}-${range.end.line + 1}`] : [];
  const ocpIndent = new processes.OcpIndent(session, args).process;
  ocpIndent.stdin.write(text);
  ocpIndent.stdin.end();
  const otxt = await new Promise<string>((resolve, reject) => {
    let buffer = "";
    ocpIndent.stdout.on("error", (error: Error) => reject(error));
    ocpIndent.stdout.on("data", (data: Buffer | string) => (buffer += data.toString()));
    ocpIndent.stdout.on("end", () => resolve(buffer));
  });
  ocpIndent.unref();
  return otxt;
}

// Temporary measure until there is some persisted list of diagnostics shared between services
let lastDiagnostics: LSP.Diagnostic[] = [];
export async function refmt(session: Session, doc: LSP.TextDocument, range?: LSP.Range): Promise<null | string> {
  if (null != range) {
    session.connection.console.warn("Selection formatting not support for Reason");
    return null;
  }
  const text = doc.getText();
  if (/^\s*$/.test(text)) return text;
  const refmt = new processes.ReFMT(session, doc).process;
  refmt.stdin.write(text);
  refmt.stdin.end();
  const otxt = await new Promise<string>((resolve, reject) => {
    let buffer = "";
    let bufferError = "";
    let eee = false;
    refmt.stdout.on("error", (error: Error) => reject(error));
    refmt.stdout.on("data", (data: Buffer | string) => (buffer += data.toString()));
    refmt.stdout.on("end", () => {
      if (!eee) {
        resolve(buffer);
      }
    });

    refmt.stderr.on("data", (data: Buffer | string) => {
      eee = true;
      bufferError += data.toString();
    });
    refmt.stderr.on("end", () => {
      eee = true;
      const diagnostics = refmtParser.parseErrors(bufferError);
      if (diagnostics.length !== 0 || diagnostics.length !== lastDiagnostics.length) {
        session.connection.sendDiagnostics({
          diagnostics,
          uri: doc.uri,
        });
      }
      lastDiagnostics = diagnostics;
      if (eee === true) {
        resolve("");
      }
    });
  });
  refmt.unref();
  return /^\s*$/.test(otxt) ? null : otxt.trim();
}
