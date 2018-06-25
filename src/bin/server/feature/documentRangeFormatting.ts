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
    const edits: LSP.TextEdit[] = [];
    edits.push(
      LSP.TextEdit.replace(
        LSP.Range.create(document.positionAt(0), document.positionAt(result.getText().length)),
        otxt,
      ),
    );
    return edits;
  });
}
