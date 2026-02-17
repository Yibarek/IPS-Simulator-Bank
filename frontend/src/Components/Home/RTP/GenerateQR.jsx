import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { flushSync } from "react-dom";

// const finalqrString = 'Scan this QR'

// --  QR Generator POPUP  --
export function open_GenerateQR_Popup() {
  document.getElementById("generateQR-popup").style.display = "block";
}

export function close_GenerateQR_Popup() {
  // document.getElementById("generateQR-popup").style.display = "block";
  document.getElementById("generateQR-popup").style.display = "none";
}

export function GenerateQRCode(UETR, amount, currency, creditorAccount, setFormState) {
  
  const updateField = (key, value) => {
    setFormState((prev) => ({ 
      ...prev,
      [key]: value,
    }));
  };
  
  const tag00 = '000201';
  const tag01 = '010212';
  console.log("UETR : " + UETR);
  
  // const UETR = UETR;
  const UETRLength1 = UETR?.length;
  const UETRLength = String(UETRLength1).padStart(2, "0");
  const creditorBank = 'YITBETAA'
  const creditorBankLength1 = creditorBank?.length;
  const creditorBankLength = String(creditorBankLength1).padStart(2, "0");
  const account = creditorAccount;
  const accountLength1 = account?.length;
  const accountLength = String(accountLength1).padStart(2, "0");

  const subTag28 = `00${UETRLength}${UETR}01${creditorBankLength}${creditorBank}02${accountLength}${account}`;
  const subTag28Length1 = subTag28?.length;
  const subTag28Length = String(subTag28Length1).padStart(2, "0");
  const tag28andsubTags = `28${subTag28Length}${subTag28}`;
  console.log("Tag 28 : " + tag28andsubTags);

  const tag52 = '52045411';
  console.log("Tag 52 : " + tag52);

  // const currency = currency
  const currencyLength1 = currency.length
  const currencyLength = String(currencyLength1).padStart(2, "0");
  const tag53 = `53${currencyLength}${currency}`;
  console.log("Tag 53 : " + tag53);

  // const amount = amount;
  const amountLength1 = String(amount).length
  const amountLength = String(amountLength1).padStart(2, "0");
  const tag54 = `54${amountLength}${amount}`;
  console.log("Tag 54 : " + tag54);

  const tag58 = '5802ET'
  console.log("Tag 58 : " + tag58);

  const merchantName = "TOMOCA COFFEE";
  // const merchantName = formState.creditorName;
  const merchantNameLength1 = merchantName?.length;
  const merchantNameLength = String(merchantNameLength1).padStart(2, "0");
  const tag59 = `59${merchantNameLength}${merchantName}`;
  console.log("Tag 59 : " + tag59);

  const city = "Addis Ababa";
  const cityLength1 = city?.length;
  const cityLength = String(cityLength1).padStart(2, "0");
  const tag60 = `60${cityLength}${city}`;
  console.log("Tag 60 : " + tag60);

  const subTag62 = `0036${UETR}0108YITBETAA02${accountLength}${account}`;
  const subTag62Length1 = subTag62?.length;
  const subTag62Length = String(subTag62Length1).padStart(2, "0");
  const tag62andsubTags = `62${subTag62Length}${subTag62}`;

  const tag84 = `84${UETRLength}${UETR}`;
  console.log("Tag 84 : " + tag84);

  const tag63 = `6304`;
  const qrStringbeforeCRC = `${tag00}${tag01}${tag28andsubTags}${tag52}${tag53}${tag54}${tag58}${tag59}${tag60}${tag84}${tag63}`;

  const crc = generateCRC16(qrStringbeforeCRC);
  console.log("crc : " + crc);
  // const crcValue = `${crc.toString(16).toUpperCase().padStart(4, '0')} (${crc})`;
  console.log(`Input for CRC Generator : ${qrStringbeforeCRC}`);

  
  // const crc = `63${crcValueLength}${crc}`;
  console.log("Tag 63 : " + tag63+crc);

  const finalqrString = `${qrStringbeforeCRC}${crc}`;
  flushSync(() => {
                      updateField("finalqrString", finalqrString);
                    });
  console.log("Final QR String : " + finalqrString);


  function generateCRC16(payload) {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF; // keep 16 bits
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}


  
}

function  GenerateQR ({formState, setFormState}) {
  // GenerateQRCode({formState, setFormState});
  return (
    <>
    <div 
      id="generateQR-popup" 
        className="generateQR-popup" >
    <div className="bg-white">
      {/* Header */} 
      <div className="poster-header">
        WE ACCEPT QR PAYMENT
      </div>

      {/* ETHQR Logo */}
      <div className="etiqr-logo">
        <img
          src="/images/ethqr_logo.png"
          alt="ETHQR"
        />
      </div>

      {/* QR Code */}
      <div className="qr-wrapper">
        <QRCodeSVG
            value = {formState.finalqrString}
            size={200}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#000000"
            marginSize={2}
            title="Scan the QR to Pay"
        />
      </div>

      {/* Merchant Info */}
      <div className="merchant-info">
        <div className="merchant-name">Tomoka Coffee</div>
        <div className="merchant-id">Merchant ID 0123456789</div>
      </div>

      {/* Acquirer */}
      <div className="acquired-by">Acquired by</div>

      {/* Bank Logo */}
      <div className="bank-logo">
        <i className="bi bi-bank"> </i> YTS Simulator Bank
      </div>

      {/* Footer */}
      <div className="poster-footer">
        Powered by 
        <img
          className="ethswitch-logo"
          src="/images/Ethswitch-logo.webp"
          alt="ethswitch"
        />
      </div>
    </div>
    </div>
    </>
  );
}

export default GenerateQR;