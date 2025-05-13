#!/bin/sh

# This script lists details about an open issue in the current repository.
# It uses the GitHub CLI to fetch the issues and formats the output.
# Usage: ./tools/show.sh <issue_number>
# Ensure the script is run from the root of the repository
# and that the GitHub CLI is installed and authenticated.
# Check if the GitHub CLI is installed
if ! command -v gh &> /dev/null
then
    echo "GitHub CLI (gh) could not be found. Please install it."
    exit 1
fi
# Check if the user is authenticated with GitHub CLI
if ! gh auth status &> /dev/null
then
    echo "You are not authenticated with GitHub CLI. Please authenticate using 'gh auth login'."
    exit 1
fi
# Fetch all open issues from the current repository
gh issue view $1 --state open
