import * as LSP from "vscode-languageserver-protocol";
import * as command from "../command";
import Session from "../session";
import * as support from "../support";

export default function(
  session: Session,
): LSP.RequestHandler<LSP.DocumentRangeFormattingParams, LSP.TextEdit[], never> {
  return support.cancellableHandler(session, async (event, _token) => {
    const range = event.range;
    const result = await command.getTextDocument(session, event.textDocument);
    if (null == result) return [];
    const document = LSP.TextDocument.create(
      event.textDocument.uri,
      result.languageId,
      result.version,
      result.getText(),
    );
    let otxt: null | string = null;
    if (document.languageId === "ocaml") otxt = await command.getFormatted.ocpIndent(session, document, range);
    if (document.languageId === "reason") otxt = await command.getFormatted.refmt(session, document, range);
    if (null == otxt || "" === otxt) return [];
    const documentNew = LSP.TextDocument.create(event.textDocument.uri, result.languageId, result.version + 1, otxt);
    const editRange = LSP.Range.create(range.start.line, 0, range.end.line + 1, 0);
    const edits: LSP.TextEdit[] = [];
    edits.push(LSP.TextEdit.replace(editRange, documentNew.getText(editRange)));
    return edits;
  });
}
