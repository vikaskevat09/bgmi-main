# Simple static file server for local preview (no Node/Python needed)
# Serves the project root at http://localhost:8080
param(
    [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot  # project root (parent of /tools)

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.htm'  = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.webp' = 'image/webp'
    '.gif'  = 'image/gif'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.txt'  = 'text/plain; charset=utf-8'
    '.xml'  = 'application/xml; charset=utf-8'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "TopUpWorld static server running at http://localhost:$Port"
Write-Host "Serving: $root"
Write-Host "Press Ctrl+C to stop."

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')

        # Clean URLs: redirect /page.html -> /page (and /index(.html) -> /)
        if ($rel -match '(?i)\.html$') {
            $cleanPath = $rel -replace '(?i)\.html$', ''
            if ($cleanPath -match '(?i)(^|/)index$') { $cleanPath = $cleanPath -replace '(?i)index$', '' }
            $res.StatusCode = 301
            $res.RedirectLocation = '/' + $cleanPath
            Write-Host "301 $rel -> /$cleanPath"
            $res.OutputStream.Close()
            continue
        }

        if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }

        $path = Join-Path $root $rel
        if (Test-Path $path -PathType Container) { $path = Join-Path $path 'index.html' }
        # Extensionless clean URL: serve /page from page.html
        elseif (-not (Test-Path $path -PathType Leaf) -and (Test-Path "$path.html" -PathType Leaf)) {
            $path = "$path.html"
        }

        if (Test-Path $path -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($path).ToLower()
            $ct = $mime[$ext]
            if (-not $ct) { $ct = 'application/octet-stream' }
            $res.ContentType = $ct
            $bytes = [System.IO.File]::ReadAllBytes($path)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "200 $rel"
        }
        else {
            $res.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rel")
            $res.OutputStream.Write($msg, 0, $msg.Length)
            Write-Host "404 $rel"
        }
        $res.OutputStream.Close()
    }
}
finally {
    $listener.Stop()
}
