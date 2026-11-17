# Re-downloads the demo item photos (Wikimedia Commons, freely licensed) into backend/src/main/resources/static/seed.
# The images are already committed to the repo; run this only if you want to refresh them.
$out = Join-Path $PSScriptRoot "..\backend\src\main\resources\static\seed"
New-Item -ItemType Directory -Force $out | Out-Null
$headers = @{ "User-Agent" = "BorrowBuddyDemo/1.0 (student project)" }
$files = [ordered]@{
  drill     = "Panasonic Cordless Drill & Driver EY1DD2, Ottobrunn (20250410-P1046293).jpg"
  ladder    = "Ladder aluminum.jpg"
  camera    = "Canon EOS 7D DSLR body back.jpg"
  tent      = "Campement - 20150802 15h44 (10723).jpg"
  bicycle   = "Specialized Source Sport-hybrid bicycle.jpg"
  projector = "InFocus IN34.jpg"
  badminton = "Badminton racket.jpg"
  guitar    = "6 string acoustic guitar body (2003-01-01 by Mark Helms).jpg"
  boardgame = "PXL 20230226 231727215 Catan Legend of the Conquerors board game.jpg"
  vacuum    = "Dyson V6 Trigger handheld vacuum.jpg"
  speaker   = "Beats By Dr. Dre Pill Portable Bluetooth Speaker Black N2.jpg"
  suitcase  = "Trolley suitcases 01.jpg"
  sewing    = "Vesta sewing machine IMGP0718.jpg"
  garden    = "Rusty Garden Tools Lay Flat (50937465362).jpg"
  books     = "Stack of Books for decor.jpg"
  pressure  = "Pressure cooker - Hawkins, Contura Model - 3 litres - 2.jpg"
  yoga      = "Yoga mat.jpg"
}
foreach ($k in $files.Keys) {
  $t = [uri]::EscapeDataString("File:" + $files[$k])
  $r = Invoke-RestMethod "https://commons.wikimedia.org/w/api.php?action=query&titles=$t&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json" -Headers $headers
  $u = ($r.query.pages.PSObject.Properties.Value)[0].imageinfo[0].thumburl
  Invoke-WebRequest $u -Headers $headers -OutFile (Join-Path $out "$k.jpg")
  "$k.jpg"; Start-Sleep -Milliseconds 800
}
# mixer.jpg was fetched from the Commons file "Electric hand mixer (Domotec)" search result and is kept as-is.
