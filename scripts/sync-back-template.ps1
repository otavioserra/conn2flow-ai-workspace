param(
    [Parameter(Mandatory = $true)]
    [string]$TargetRepoPath,

    [ValidateSet('pt-br', 'en')]
    [string]$Language = 'pt-br',

    [ValidateSet('', 'private-project-claude-kit', 'private-project-copilot-kit', 'spec-driven-project-claude-kit', 'spec-driven-project-copilot-kit')]
    [string]$KitName = '',

    [string]$AgentPrefix = ''
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspaceRoot = (Resolve-Path (Join-Path $scriptDir '..')).Path
$languageRoot = (Resolve-Path (Join-Path (Join-Path $workspaceRoot 'templates') $Language)).Path

if (-not (Test-Path $TargetRepoPath)) {
    throw "Target repo path does not exist: $TargetRepoPath"
}

$targetRoot = (Resolve-Path $TargetRepoPath).Path

function Get-DetectedKits {
    param(
        [string]$RepoRoot
    )

    $markers = @(
        @{ Kit = 'private-project-claude-kit'; Marker = '.claude\skills\private-project-context\SKILL.md' },
        @{ Kit = 'private-project-copilot-kit'; Marker = '.github\skills\private-project-context\SKILL.md' },
        @{ Kit = 'spec-driven-project-claude-kit'; Marker = '.claude\skills\sdd-workflow\SKILL.md' },
        @{ Kit = 'spec-driven-project-copilot-kit'; Marker = '.github\skills\sdd-workflow\SKILL.md' }
    )

    return @(
        $markers |
            Where-Object { Test-Path (Join-Path $RepoRoot $_.Marker) } |
            ForEach-Object { $_.Kit }
    )
}

function Get-KitPlan {
    param(
        [string]$ResolvedKit
    )

    switch ($ResolvedKit) {
        'private-project-claude-kit' {
            return @(
                @{ Source = 'CLAUDE.md'; Destination = 'CLAUDE.md' },
                @{ Source = '.claude\settings.json'; Destination = '.claude\settings.json' },
                @{ Source = '.claude\rules'; Destination = '.claude\rules' },
                @{ Source = '.claude\agents'; Destination = '.claude\agents' },
                @{ Source = '.claude\skills'; Destination = '.claude\skills' },
                @{ Source = 'docs'; Destination = 'docs' }
            )
        }
        'private-project-copilot-kit' {
            return @(
                @{ Source = '.github\copilot-instructions.md'; Destination = '.github\copilot-instructions.md' },
                @{ Source = '.github\instructions'; Destination = '.github\instructions' },
                @{ Source = '.github\agents'; Destination = '.github\agents' },
                @{ Source = '.github\prompts'; Destination = '.github\prompts' },
                @{ Source = '.github\skills'; Destination = '.github\skills' },
                @{ Source = '.github\hooks'; Destination = '.github\hooks' },
                @{ Source = 'docs'; Destination = 'docs' },
                @{ Source = 'scripts\hooks'; Destination = 'scripts\hooks' }
            )
        }
        'spec-driven-project-claude-kit' {
            return @(
                @{ Source = 'CLAUDE.md'; Destination = 'CLAUDE.md' },
                @{ Source = '.claude\settings.json'; Destination = '.claude\settings.json' },
                @{ Source = '.claude\rules'; Destination = '.claude\rules' },
                @{ Source = '.claude\agents'; Destination = '.claude\agents' },
                @{ Source = '.claude\skills'; Destination = '.claude\skills' }
            )
        }
        'spec-driven-project-copilot-kit' {
            return @(
                @{ Source = '.github\copilot-instructions.md'; Destination = '.github\copilot-instructions.md' },
                @{ Source = '.github\instructions'; Destination = '.github\instructions' },
                @{ Source = '.github\agents'; Destination = '.github\agents' },
                @{ Source = '.github\prompts'; Destination = '.github\prompts' },
                @{ Source = '.github\skills'; Destination = '.github\skills' },
                @{ Source = '.github\hooks'; Destination = '.github\hooks' },
                @{ Source = 'sdd\scripts\hooks'; Destination = 'sdd\scripts\hooks' }
            )
        }
        default {
            throw "Unsupported kit name: $ResolvedKit"
        }
    }
}

function Get-AgentMetadata {
    param(
        [string]$ResolvedKit
    )

    switch ($ResolvedKit) {
        'private-project-claude-kit' {
            return @{
                Directory = '.claude\agents'
                Extension = '.md'
                BaseNames = @('private-project-coordinator', 'private-project-implementer', 'private-project-reviewer')
                CoordinatorSuffix = '-coordinator'
                ImplementerSuffix = '-implementer'
                ReviewerSuffix = '-reviewer'
            }
        }
        'private-project-copilot-kit' {
            return @{
                Directory = '.github\agents'
                Extension = '.agent.md'
                BaseNames = @('private-project-coordinator', 'private-project-implementer', 'private-project-reviewer')
                CoordinatorSuffix = '-coordinator'
                ImplementerSuffix = '-implementer'
                ReviewerSuffix = '-reviewer'
            }
        }
        'spec-driven-project-claude-kit' {
            return @{
                Directory = '.claude\agents'
                Extension = '.md'
                BaseNames = @('sdd-coordinator', 'sdd-implementer', 'sdd-reviewer')
                CoordinatorSuffix = '-sdd-coordinator'
                ImplementerSuffix = '-sdd-implementer'
                ReviewerSuffix = '-sdd-reviewer'
            }
        }
        'spec-driven-project-copilot-kit' {
            return @{
                Directory = '.github\agents'
                Extension = '.agent.md'
                BaseNames = @('sdd-coordinator', 'sdd-implementer', 'sdd-reviewer')
                CoordinatorSuffix = '-sdd-coordinator'
                ImplementerSuffix = '-sdd-implementer'
                ReviewerSuffix = '-sdd-reviewer'
            }
        }
        default {
            return $null
        }
    }
}

function Resolve-AgentPrefix {
    param(
        [string]$RepoRoot,
        [string]$ResolvedKit,
        [string]$ExplicitPrefix
    )

    if (-not [string]::IsNullOrWhiteSpace($ExplicitPrefix)) {
        return $ExplicitPrefix
    }

    $metadata = Get-AgentMetadata -ResolvedKit $ResolvedKit
    if ($null -eq $metadata) {
        return ''
    }

    $agentsDir = Join-Path $RepoRoot $metadata.Directory
    if (-not (Test-Path $agentsDir)) {
        return ''
    }

    $hasBaseAgents = $true
    foreach ($baseName in $metadata.BaseNames) {
        $basePath = Join-Path $agentsDir ($baseName + $metadata.Extension)
        if (-not (Test-Path $basePath)) {
            $hasBaseAgents = $false
            break
        }
    }

    if ($hasBaseAgents) {
        return ''
    }

    $candidatePrefixes = @()
    foreach ($file in Get-ChildItem -LiteralPath $agentsDir -File) {
        if (-not $file.Name.EndsWith($metadata.Extension)) {
            continue
        }

        $baseFileName = $file.Name.Substring(0, $file.Name.Length - $metadata.Extension.Length)
        if (-not $baseFileName.EndsWith($metadata.CoordinatorSuffix)) {
            continue
        }

        $candidatePrefix = $baseFileName.Substring(0, $baseFileName.Length - $metadata.CoordinatorSuffix.Length)
        if ([string]::IsNullOrWhiteSpace($candidatePrefix)) {
            continue
        }

        $implementerPath = Join-Path $agentsDir ($candidatePrefix + $metadata.ImplementerSuffix + $metadata.Extension)
        $reviewerPath = Join-Path $agentsDir ($candidatePrefix + $metadata.ReviewerSuffix + $metadata.Extension)

        if ((Test-Path $implementerPath) -and (Test-Path $reviewerPath)) {
            $candidatePrefixes += $candidatePrefix
        }
    }

    $candidatePrefixes = @($candidatePrefixes | Sort-Object -Unique)
    if ($candidatePrefixes.Count -gt 1) {
        throw "Could not infer a single agent prefix for $ResolvedKit. Use -AgentPrefix explicitly."
    }

    if ($candidatePrefixes.Count -eq 1) {
        return $candidatePrefixes[0]
    }

    return ''
}

function Get-AgentMappings {
    param(
        [string]$ResolvedKit,
        [string]$DetectedPrefix
    )

    if ([string]::IsNullOrWhiteSpace($DetectedPrefix)) {
        return @()
    }

    switch ($ResolvedKit) {
        'private-project-claude-kit' {
            return @(
                @{ Old = "$DetectedPrefix-coordinator"; New = 'private-project-coordinator' },
                @{ Old = "$DetectedPrefix-implementer"; New = 'private-project-implementer' },
                @{ Old = "$DetectedPrefix-reviewer"; New = 'private-project-reviewer' }
            )
        }
        'private-project-copilot-kit' {
            return @(
                @{ Old = "$DetectedPrefix-coordinator"; New = 'private-project-coordinator' },
                @{ Old = "$DetectedPrefix-implementer"; New = 'private-project-implementer' },
                @{ Old = "$DetectedPrefix-reviewer"; New = 'private-project-reviewer' }
            )
        }
        'spec-driven-project-claude-kit' {
            return @(
                @{ Old = "$DetectedPrefix-sdd-coordinator"; New = 'sdd-coordinator' },
                @{ Old = "$DetectedPrefix-sdd-implementer"; New = 'sdd-implementer' },
                @{ Old = "$DetectedPrefix-sdd-reviewer"; New = 'sdd-reviewer' }
            )
        }
        'spec-driven-project-copilot-kit' {
            return @(
                @{ Old = "$DetectedPrefix-sdd-coordinator"; New = 'sdd-coordinator' },
                @{ Old = "$DetectedPrefix-sdd-implementer"; New = 'sdd-implementer' },
                @{ Old = "$DetectedPrefix-sdd-reviewer"; New = 'sdd-reviewer' }
            )
        }
        default {
            return @()
        }
    }
}

function Test-TextFile {
    param(
        [string]$Path
    )

    $extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
    return @('.md', '.json', '.ps1', '.sh') -contains $extension
}

function Normalize-Value {
    param(
        [string]$Value,
        [array]$Mappings
    )

    $updated = $Value
    foreach ($mapping in $Mappings) {
        $updated = $updated.Replace($mapping.Old, $mapping.New)
    }

    return $updated
}

function Write-Utf8NoBom {
    param(
        [string]$Path,
        [string]$Content
    )

    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

function Copy-TransformedFile {
    param(
        [string]$SourcePath,
        [string]$DestinationPath,
        [array]$Mappings
    )

    if (Test-TextFile -Path $SourcePath) {
        $content = Get-Content -LiteralPath $SourcePath -Raw
        $updated = Normalize-Value -Value $content -Mappings $Mappings
        Write-Utf8NoBom -Path $DestinationPath -Content $updated
        return
    }

    Copy-Item -LiteralPath $SourcePath -Destination $DestinationPath -Force
}

function Sync-Path {
    param(
        [string]$SourcePath,
        [string]$DestinationPath,
        [array]$Mappings
    )

    if (-not (Test-Path $SourcePath)) {
        Write-Warning "Skipping missing source path: $SourcePath"
        return
    }

    $sourceItem = Get-Item -LiteralPath $SourcePath
    if (-not $sourceItem.PSIsContainer) {
        $destinationParent = Split-Path -Parent $DestinationPath
        if (-not [string]::IsNullOrWhiteSpace($destinationParent)) {
            New-Item -ItemType Directory -Force -Path $destinationParent | Out-Null
        }

        Copy-TransformedFile -SourcePath $SourcePath -DestinationPath $DestinationPath -Mappings $Mappings
        Write-Host "Synced: $SourcePath -> $DestinationPath"
        return
    }

    New-Item -ItemType Directory -Force -Path $DestinationPath | Out-Null

    Get-ChildItem -LiteralPath $SourcePath -Recurse -Force | ForEach-Object {
        $relativePath = $_.FullName.Substring($SourcePath.Length).TrimStart([char[]]@('\', '/'))
        if ([string]::IsNullOrWhiteSpace($relativePath)) {
            return
        }

        $normalizedRelativePath = Normalize-Value -Value $relativePath -Mappings $Mappings
        $targetPath = Join-Path $DestinationPath $normalizedRelativePath

        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
            return
        }

        $targetParent = Split-Path -Parent $targetPath
        New-Item -ItemType Directory -Force -Path $targetParent | Out-Null
        Copy-TransformedFile -SourcePath $_.FullName -DestinationPath $targetPath -Mappings $Mappings
        Write-Host "Synced: $($_.FullName) -> $targetPath"
    }
}

$resolvedKit = $KitName
if ([string]::IsNullOrWhiteSpace($resolvedKit)) {
    $detectedKits = @(Get-DetectedKits -RepoRoot $targetRoot)
    if ($detectedKits.Count -eq 0) {
        throw 'Could not detect a supported kit in the target repo. Use -KitName explicitly.'
    }

    if ($detectedKits.Count -gt 1) {
        throw "Multiple supported kits were detected in the target repo ($($detectedKits -join ', ')). Use -KitName explicitly."
    }

    $resolvedKit = [string]$detectedKits[0]
}

$templateRootPath = Join-Path (Join-Path $languageRoot 'templates') ([string]$resolvedKit)
$templateRoot = (Resolve-Path $templateRootPath).Path
$syncPlan = Get-KitPlan -ResolvedKit $resolvedKit
$detectedPrefix = Resolve-AgentPrefix -RepoRoot $targetRoot -ResolvedKit $resolvedKit -ExplicitPrefix $AgentPrefix
$agentMappings = Get-AgentMappings -ResolvedKit $resolvedKit -DetectedPrefix $detectedPrefix

Write-Host "Detected kit: $resolvedKit"
if ([string]::IsNullOrWhiteSpace($detectedPrefix)) {
    Write-Host 'Detected agent prefix: <none>'
}
else {
    Write-Host "Detected agent prefix: $detectedPrefix"
}

foreach ($item in $syncPlan) {
    $sourcePath = Join-Path $targetRoot $item.Source
    $destinationPath = Join-Path $templateRoot $item.Destination
    Sync-Path -SourcePath $sourcePath -DestinationPath $destinationPath -Mappings $agentMappings
}

Write-Host 'Template sync-back finished.'