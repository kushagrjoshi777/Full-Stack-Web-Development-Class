# End-to-end API smoke test against a running backend (http://localhost:8080) and MySQL.
# Usage: powershell -ExecutionPolicy Bypass -File database\api_smoke_test.ps1
$base = "http://localhost:8080/api"
$script:pass = 0; $script:fail = 0

function Call($method, $path, $body = $null, $token = $null) {
  $h = @{}
  if ($token) { $h["Authorization"] = "Bearer $token" }
  try {
    $args = @{ Uri = "$base$path"; Method = $method; Headers = $h; UseBasicParsing = $true }
    if ($body -ne $null) { $args.Body = ($body | ConvertTo-Json -Depth 5); $args.ContentType = "application/json" }
    $r = Invoke-WebRequest @args
    return @{ code = [int]$r.StatusCode; json = if ($r.Content) { $r.Content | ConvertFrom-Json } else { $null } }
  } catch {
    $code = 0; $json = $null
    if ($_.Exception.Response) {
      $code = [int]$_.Exception.Response.StatusCode
      try { $sr = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream()); $json = $sr.ReadToEnd() | ConvertFrom-Json } catch {}
    }
    return @{ code = $code; json = $json }
  }
}
function Check($name, $actual, $expected) {
  if ($actual -eq $expected) { $script:pass++; Write-Host "PASS  $name ($actual)" -ForegroundColor Green }
  else { $script:fail++; Write-Host "FAIL  $name (got $actual, expected $expected)" -ForegroundColor Red }
}
$d = { param($n) (Get-Date).AddDays($n).ToString("yyyy-MM-dd") }
$stamp = Get-Date -Format "HHmmss"

# ---- Auth ----
$reg = Call POST "/auth/register" @{ name = "Test Alice"; email = "alice$stamp@test.in"; password = "secret123"; location = "Adyar, Chennai" }
Check "register" $reg.code 201
Check "register response has no password hash" ($reg.json.user.PSObject.Properties.Name -contains "passwordHash") $false
Check "duplicate email rejected" (Call POST "/auth/register" @{ name = "X"; email = "alice$stamp@test.in"; password = "secret123" }).code 409
Check "short password rejected" (Call POST "/auth/register" @{ name = "X"; email = "x$stamp@test.in"; password = "123" }).code 400
Check "invalid email rejected" (Call POST "/auth/register" @{ name = "X"; email = "nope"; password = "secret123" }).code 400
Check "wrong password -> 401" (Call POST "/auth/login" @{ email = "demo@borrowbuddy.in"; password = "bad" }).code 401
$alice = $reg.json.token
$demo = (Call POST "/auth/login" @{ email = "demo@borrowbuddy.in"; password = "Password@123" }).json.token
$admin = (Call POST "/auth/login" @{ email = "admin@borrowbuddy.in"; password = "Admin@123" }).json.token
$priya = (Call POST "/auth/login" @{ email = "priya.raman@example.in"; password = "Password@123" }).json.token
Check "demo login gives token" ([bool]$demo) $true
Check "admin login gives token" ([bool]$admin) $true
Check "/auth/me" (Call GET "/auth/me" $null $alice).json.email "alice$stamp@test.in"

# ---- Authorization ----
Check "anonymous create item -> 401" (Call POST "/items" @{ title = "x" }).code 401
Check "anonymous dashboard -> 401" (Call GET "/dashboard/stats").code 401
Check "user hits admin API -> 403" (Call GET "/admin/stats" $null $demo).code 403
Check "admin hits admin API -> 200" (Call GET "/admin/stats" $null $admin).code 200
Check "tampered token -> 401" (Call GET "/auth/me" $null ($alice + "x")).code 401

# ---- Catalogue ----
$cats = (Call GET "/categories").json
Check "categories >= 8" ($cats.Count -ge 8) $true
$all = (Call GET "/items").json
Check "marketplace >= 15 items" ($all.Count -ge 15) $true
Check "search 'drill'" ((Call GET "/items?q=drill").json.Count -ge 1) $true
Check "search no match" (Call GET "/items?q=zzzzqqq").json.Count 0
Check "filter FREE" ((Call GET "/items?priceType=FREE").json | ? { -not $_.free }).Count 0
Check "filter PAID" ((Call GET "/items?priceType=PAID").json | ? { $_.free }).Count 0
Check "filter category" ((Call GET "/items?categoryId=$($cats[0].id)").json | ? { $_.categoryId -ne $cats[0].id }).Count 0
Check "filter location" ((Call GET "/items?location=Velachery").json.Count -ge 1) $true

# ---- Item CRUD ----
$newItem = @{ title = "Test Hammer $stamp"; description = "Claw hammer"; categoryId = $cats[0].id; condition = "GOOD"; location = "Anna Nagar, Chennai"; dailyPrice = 25; status = "AVAILABLE" }
$c = Call POST "/items" $newItem $demo
Check "create item" $c.code 201
$iid = $c.json.id
$bad = $newItem.Clone(); $bad.title = ""
Check "invalid item (blank title) -> 400" (Call POST "/items" $bad $demo).code 400
Check "search finds new item" ((Call GET "/items?q=Test Hammer $stamp").json.Count) 1
Check "alice cannot edit demo's item -> 403" (Call PUT "/items/$iid" $newItem $alice).code 403
Check "alice cannot delete demo's item -> 403" (Call DELETE "/items/$iid" $null $alice).code 403
$newItem.title = "Test Hammer v2 $stamp"
Check "owner updates item" (Call PUT "/items/$iid" $newItem $demo).json.title $newItem.title
Check "item detail public" (Call GET "/items/$iid").code 200
Check "item not found -> 404" (Call GET "/items/999999").code 404

# ---- Borrowing workflow ----
Check "owner cannot borrow own item -> 403" (Call POST "/requests" @{ itemId = $iid; startDate = (& $d 1); endDate = (& $d 2) } $demo).code 403
Check "past date rejected -> 400" (Call POST "/requests" @{ itemId = $iid; startDate = (& $d -5); endDate = (& $d 2) } $alice).code 400
Check "end before start rejected -> 400" (Call POST "/requests" @{ itemId = $iid; startDate = (& $d 5); endDate = (& $d 2) } $alice).code 400
$r1 = Call POST "/requests" @{ itemId = $iid; startDate = (& $d 3); endDate = (& $d 6); message = "Need it" } $alice
Check "alice requests item" $r1.code 201
Check "request starts PENDING" $r1.json.status "PENDING"
Check "total price = days*price (4*25)" ([double]$r1.json.totalPrice) 100.0
$rid = $r1.json.id
Check "borrower cannot approve -> 403" (Call PATCH "/requests/$rid/approve" $null $alice).code 403
Check "other user cannot approve -> 403" (Call PATCH "/requests/$rid/approve" $null $priya).code 403
Check "cannot hand over a PENDING request -> 409" (Call PATCH "/requests/$rid/handover" $null $demo).code 409
$r2 = Call POST "/requests" @{ itemId = $iid; startDate = (& $d 5); endDate = (& $d 8) } $priya
Check "second overlapping pending request allowed" $r2.code 201
Check "owner approves first" (Call PATCH "/requests/$rid/approve" $null $demo).json.status "APPROVED"
Check "approving overlapping second -> 409" (Call PATCH "/requests/$($r2.json.id)/approve" $null $demo).code 409
Check "new overlapping request rejected -> 409" (Call POST "/requests" @{ itemId = $iid; startDate = (& $d 4); endDate = (& $d 5) } $priya).code 409
Check "owner rejects second" (Call PATCH "/requests/$($r2.json.id)/reject" $null $demo).json.status "REJECTED"
Check "bookings list shows approved range" ((Call GET "/items/$iid/bookings").json.Count) 1
Check "borrower cannot cancel APPROVED -> 409" (Call PATCH "/requests/$rid/cancel" $null $alice).code 409
Check "cannot mark return before handover -> 409" (Call PATCH "/requests/$rid/return" $null $demo).code 409
Check "handover -> ACTIVE" (Call PATCH "/requests/$rid/handover" $null $demo).json.status "ACTIVE"
Check "item now BORROWED" (Call GET "/items/$iid").json.status "BORROWED"
Check "cannot delete item with active booking -> 409" (Call DELETE "/items/$iid" $null $demo).code 409
Check "return -> RETURNED" (Call PATCH "/requests/$rid/return" $null $demo).json.status "RETURNED"
Check "item AVAILABLE again" (Call GET "/items/$iid").json.status "AVAILABLE"
Check "returning twice -> 409" (Call PATCH "/requests/$rid/return" $null $demo).code 409

# borrower cancels pending
$r3 = Call POST "/requests" @{ itemId = $iid; startDate = (& $d 10); endDate = (& $d 11) } $alice
Check "borrower cancels PENDING" (Call PATCH "/requests/$($r3.json.id)/cancel" $null $alice).json.status "CANCELLED"
Check "incoming for owner includes requests" ((Call GET "/requests/incoming" $null $demo).json | ? { $_.itemId -eq $iid }).Count 3
Check "outgoing for alice" ((Call GET "/requests/outgoing" $null $alice).json.Count) 2
Check "dashboard stats" ((Call GET "/dashboard/stats" $null $alice).json.completedBorrows) 1

# ---- Paused listing cannot be requested ----
$newItem.status = "UNAVAILABLE"; Call PUT "/items/$iid" $newItem $demo | Out-Null
Check "unavailable item not in marketplace" ((Call GET "/items?q=Test Hammer v2 $stamp").json.Count) 0
Check "request on UNAVAILABLE -> 409" (Call POST "/requests" @{ itemId = $iid; startDate = (& $d 20); endDate = (& $d 21) } $alice).code 409

# ---- Delete ----
Check "owner deletes item" (Call DELETE "/items/$iid" $null $demo).code 204
Check "deleted item -> 404" (Call GET "/items/$iid").code 404

# ---- Admin moderation ----
$users = (Call GET "/admin/users" $null $admin).json
$aliceUser = $users | ? { $_.email -eq "alice$stamp@test.in" }
Check "admin lists users (no hashes)" ($users[0].PSObject.Properties.Name -contains "passwordHash") $false
Check "admin suspends alice" (Call PATCH "/admin/users/$($aliceUser.id)/enabled" @{ enabled = $false } $admin).json.enabled $false
Check "suspended user cannot login -> 403" (Call POST "/auth/login" @{ email = "alice$stamp@test.in"; password = "secret123" }).code 403
Check "suspended user's token rejected -> 401" (Call GET "/auth/me" $null $alice).code 401
Check "admin reinstates alice" (Call PATCH "/admin/users/$($aliceUser.id)/enabled" @{ enabled = $true } $admin).json.enabled $true
Check "admin lists items" ((Call GET "/admin/items" $null $admin).json.Count -ge 15) $true
Check "admin lists requests" ((Call GET "/admin/requests" $null $admin).json.Count -ge 16) $true
Check "public stats" ((Call GET "/stats/public").json.members -ge 10) $true

Write-Host "`nPassed: $script:pass   Failed: $script:fail" -ForegroundColor $(if ($script:fail -eq 0) { "Green" } else { "Red" })
exit $script:fail
