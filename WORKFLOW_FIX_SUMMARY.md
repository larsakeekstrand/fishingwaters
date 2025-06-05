# GitHub Actions Workflow Fix Summary

## Issue Identified
Acceptance tests were running **twice** when committing to main branch.

## Root Cause
The workflow triggers were too broad and not properly filtering by branch:

### Problem 1: Deploy Workflow
- **Issue**: `Deploy to GitHub Pages` workflow was triggering on **any** successful `Build, Test, and Tag` completion
- **Impact**: Could trigger from successful builds on feature branches or old builds
- **Fix**: Added `github.event.workflow_run.head_branch == 'main'` condition

### Problem 2: Acceptance Tests Workflow  
- **Issue**: `Acceptance Tests` was triggering on **any** successful `Deploy to GitHub Pages` completion
- **Impact**: Multiple deployments = multiple acceptance test runs
- **Fix**: Added same branch filtering condition

## Solution Applied

### Updated Conditions
**Before:**
```yaml
if: ${{ github.event.workflow_run.conclusion == 'success' && github.event_name != 'workflow_dispatch' }} || ${{ github.event_name == 'workflow_dispatch' }}
```

**After:**
```yaml
if: |
  (github.event.workflow_run.conclusion == 'success' && 
   github.event.workflow_run.head_branch == 'main' && 
   github.event_name != 'workflow_dispatch') || 
  github.event_name == 'workflow_dispatch'
```

### Added Debugging
- Added debug steps to log trigger information
- Helps identify future workflow trigger issues

## Expected Workflow Chain
```
Push to main → Build, Test, and Tag → Deploy to GitHub Pages → Acceptance Tests
```

**Now each step will only trigger ONCE per main branch commit.**

## Files Modified
- `.github/workflows/github-pages-deploy.yml`
- `.github/workflows/acceptance-tests.yml`

## Testing
The fix will be validated with the next commit to main branch.