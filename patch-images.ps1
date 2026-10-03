$file = 'C:\Users\Amruth\Desktop\SecureFlow AI\secureflow-ai\src\components\evidence\EvidenceLibraryClient.tsx'
$lines = Get-Content $file

# Find the line with "const isSafe = analysis.overall_severity === 'low';" and replace it
$newLines = for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match "const isSafe = analysis\.overall_severity === 'low';") {
        # Insert secureUrl line before isSafe
        $indent = "                   "
        $indent + "const secureUrl = evidence?.secure_url as string | undefined;"
        $indent + 'const isSafe = !["high", "critical"].includes(String(analysis.overall_severity));'
    } else {
        $line
    }
}

$newLines | Set-Content $file
Write-Host "Patched $($newLines.Count) lines"
