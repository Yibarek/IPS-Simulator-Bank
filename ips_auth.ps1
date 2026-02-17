# ==============================
# EthSwitch IPS Authentication
# Windows PowerShell Version
# ==============================

$PRIVATE_KEY_PATH = ".\private.key"
$BIC_CODE = "SHCAETAA"
$USERNAME = "UN"
$PASSWORD = "PASS"
$IPS_URL = "http://192.168.20.45:9001/v1/token"

$CERT_ISS = "CN=TEST ETS IPS Issuing CA,O=EthSwitch,C=ET"
$CERT_SN = "646721610771729061870823511585186903880630274"

Write-Host "=== EthSwitch IPS Authentication Test ==="

# Generate timestamps
$NOW = [int][double]::Parse((Get-Date -UFormat %s))
$EXP = $NOW + 300     # 5 minutes
$JTI = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

Write-Host "JTI: $JTI"
Write-Host "Expiration: $EXP"

# Function: Base64URL Encode
function Base64UrlEncode($bytes) {
    $base64 = [Convert]::ToBase64String($bytes)
    $base64 = $base64.TrimEnd("=") -replace '\+', '-' -replace '/', '_'
    return $base64
}

# JWT Header
$HEADER = '{"alg":"RS256","typ":"JWT"}'
$HEADER_B64 = Base64UrlEncode([Text.Encoding]::UTF8.GetBytes($HEADER))

# JWT Payload
$PAYLOAD = @"
{
  "iss": "$BIC_CODE",
  "cert_iss": "$CERT_ISS",
  "cert_sn": "$CERT_SN",
  "iat": $NOW,
  "exp": $EXP,
  "jti": "$JTI"
}
"@

$PAYLOAD_B64 = Base64UrlEncode([Text.Encoding]::UTF8.GetBytes($PAYLOAD))

$SIG_INPUT = "$HEADER_B64.$PAYLOAD_B64"

# Sign using OpenSSL (must be installed on Windows)
$signatureBytes = $SIG_INPUT | openssl dgst -sha256 -sign $PRIVATE_KEY_PATH
$SIG = Base64UrlEncode($signatureBytes)

$JWT = "$SIG_INPUT.$SIG"

Write-Host "Sending request..."

# Send HTTP request
$response = Invoke-RestMethod `
    -Method Post `
    -Uri $IPS_URL `
    -Headers @{ "jwt-assertion" = $JWT } `
    -ContentType "application/x-www-form-urlencoded" `
    -Body "grant_type=password&username=$USERNAME&password=$PASSWORD"

$response
