import { formatDateWithOffset } from "./dateUtils.js";


export const buildAcmt023Xml = ({ creditorBank, creditorAccount }) => {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .padEnd(20, "0");

  const random = Math.floor(10000 + Math.random() * 90000);

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<FPEnvelope xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03"
            xmlns:document="urn:iso:std:iso:20022:tech:xsd:acmt.023.001.03"
            xmlns="urn:iso:std:iso:20022:tech:xsd:verification_request">
  <header:AppHdr>
    <header:Fr>
      <header:FIId>
        <header:FinInstnId>
          <header:Othr>
            <header:Id>${process.env.BIC}</header:Id>
          </header:Othr>
        </header:FinInstnId>
      </header:FIId>
    </header:Fr>
    <header:To>
      <header:FIId>
        <header:FinInstnId>
          <header:Othr>
            <header:Id>FP</header:Id>
          </header:Othr>
        </header:FinInstnId>
      </header:FIId>
    </header:To>
    <header:BizMsgIdr>${process.env.BIC}${timestamp}</header:BizMsgIdr>
    <header:MsgDefIdr>acmt.023.001.03</header:MsgDefIdr>
    <header:CreDt>${now.toISOString()}</header:CreDt>
  </header:AppHdr>
  <document:Document>
    <document:IdVrfctnReq>
      <document:Assgnmt>
        <document:MsgId>${process.env.BIC}${timestamp}</document:MsgId>
        <document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
        <document:Assgnr>
          <document:Agt>
            <document:FinInstnId>
              <document:Othr>
                <document:Id>${process.env.BIC}</document:Id>
              </document:Othr>
            </document:FinInstnId>
          </document:Agt>
        </document:Assgnr>
        <document:Assgne>
          <document:Agt>
            <document:FinInstnId>
              <document:Othr>
                <document:Id>${creditorBank}</document:Id>
              </document:Othr>
            </document:FinInstnId>
          </document:Agt>
        </document:Assgne>
      </document:Assgnmt>
      <document:Vrfctn>
        <document:Id>${process.env.BIC}${timestamp}${random}</document:Id>
        <document:PtyAndAcctId>
          <document:Acct>
            <document:Id>
              <document:Othr>
                <document:Id>${creditorAccount}</document:Id>
                <document:SchmeNm>
                  <document:Prtry>ACCT</document:Prtry>
                </document:SchmeNm>
              </document:Othr>
            </document:Id>
          </document:Acct>
        </document:PtyAndAcctId>
      </document:Vrfctn>
    </document:IdVrfctnReq>
  </document:Document>
</FPEnvelope>`;
};
