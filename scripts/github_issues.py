#!/usr/bin/env python3
"""
GitHub Issues Fetcher

A simple script to fetch open issues from a GitHub repository and optionally fix them with Claude,
creating branches and PRs in the process.
"""
import requests
import sys
import argparse
import subprocess
import os
import re
from typing import List, Dict, Any, Tuple


def get_issues(owner: str, repo: str, token: str = None) -> List[Dict[str, Any]]:
    """
    Fetch open issues from a GitHub repository.
    
    Args:
        owner: GitHub username or organization name
        repo: Repository name
        token: GitHub personal access token (optional)
    
    Returns:
        List of issue dictionaries
    """
    url = f"https://api.github.com/repos/{owner}/{repo}/issues?state=open"
    
    headers = {
        "Accept": "application/vnd.github.v3+json"
    }
    
    if token:
        headers["Authorization"] = f"token {token}"
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return []


def get_issue_details(owner: str, repo: str, issue_id: int, token: str = None) -> Dict[str, Any]:
    """
    Fetch details of a specific GitHub issue.
    
    Args:
        owner: GitHub username or organization name
        repo: Repository name
        issue_id: Issue number
        token: GitHub personal access token (optional)
    
    Returns:
        Issue dictionary or None if not found
    """
    url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_id}"
    
    headers = {
        "Accept": "application/vnd.github.v3+json"
    }
    
    if token:
        headers["Authorization"] = f"token {token}"
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None


def display_issues(issues: List[Dict[str, Any]]) -> None:
    """
    Display issues in a formatted way.
    
    Args:
        issues: List of issue dictionaries
    """
    if not issues:
        print("No open issues found.")
        return
        
    print(f"Found {len(issues)} open issues:\n")
    
    for issue in issues:
        print(f"#{issue['number']} - {issue['title']}")
        print(f"  URL: {issue['html_url']}")
        print(f"  Created by: {issue['user']['login']}")
        print(f"  Created at: {issue['created_at']}")
        if issue.get('labels'):
            labels = ", ".join([label['name'] for label in issue['labels']])
            print(f"  Labels: {labels}")
        print()


def display_issue_details(issue: Dict[str, Any]) -> None:
    """
    Display detailed information about a specific issue.
    
    Args:
        issue: Issue dictionary
    """
    if not issue:
        print("Issue not found.")
        return
    
    print(f"\n=== ISSUE #{issue['number']} ===")
    print(f"Title: {issue['title']}")
    print(f"URL: {issue['html_url']}")
    print(f"Status: {issue['state']}")
    print(f"Created by: {issue['user']['login']}")
    print(f"Created at: {issue['created_at']}")
    if issue.get('updated_at'):
        print(f"Updated at: {issue['updated_at']}")
    if issue.get('closed_at'):
        print(f"Closed at: {issue['closed_at']}")
    if issue.get('labels'):
        labels = ", ".join([label['name'] for label in issue['labels']])
        print(f"Labels: {labels}")
    if issue.get('assignees') and issue['assignees']:
        assignees = ", ".join([user['login'] for user in issue['assignees']])
        print(f"Assignees: {assignees}")
    if issue.get('milestone'):
        print(f"Milestone: {issue['milestone']['title']}")
    
    print("\nDescription:")
    print(issue.get('body', 'No description provided.'))
    
    if issue.get('comments') > 0:
        print(f"\nComments: {issue['comments']} (view them at {issue['html_url']})")
    print("="*30)


def plan_with_claude(owner: str, repo: str, issue_id: int, token: str = None) -> None:
    """
    Use Claude to plan a fix for the specified issue.
    
    Args:
        owner: GitHub username or organization name
        repo: Repository name
        issue_id: Issue number
        token: GitHub personal access token (optional)
    """
    issue = get_issue_details(owner, repo, issue_id, token)
    if not issue:
        print("Issue not found.")
        return
    
    print(f"\n=== Using Claude to plan a fix for Issue #{issue_id}: {issue['title']} ===")
    
    # Check if claude-code command exists
    try:
        # Display issue details
        print("\nPlanning a solution for this issue:")
        print(f"Title: {issue['title']}")
        print(f"Description: {issue.get('body', 'No description provided.')}")
        
        # Build the prompt for Claude
        issue_prompt = f"Plan a solution for issue #{issue_id}: {issue['title']}\n\nPlease analyze the issue and provide a detailed plan for how to fix it. Do not make any changes yet, just outline the approach you would take.\n\n{issue.get('body', '')}"
        
        # Call claude with the planning prompt
        print("\nLaunching Claude Code to plan the fix...\n")
        subprocess.run(["claude", "-p", issue_prompt, "--allowedTools", "Bash,WebFetch,Read,Write,Edit"], check=True)
        
        print("\nClaude Code planning process completed.")
        
    except FileNotFoundError:
        print("Error: 'claude' command not found.")
        print("Please install Claude Code CLI to use this feature.")
    except subprocess.CalledProcessError as e:
        print(f"Error running Claude Code: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")


def create_branch_name(issue_id: int, issue_title: str) -> str:
    """
    Create a branch name from issue ID and title.
    
    Args:
        issue_id: Issue number
        issue_title: Issue title
    
    Returns:
        A branch name formatted as fix-issue-X-short-title
    """
    # Convert title to lowercase and replace spaces with dashes
    slug = issue_title.lower()
    # Remove special characters
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # Replace spaces with dashes
    slug = re.sub(r'\s+', '-', slug)
    # Limit the length
    short_slug = slug[:30]
    # Trim trailing dashes
    short_slug = short_slug.rstrip('-')
    
    return f"fix-issue-{issue_id}-{short_slug}"


def check_git_status() -> bool:
    """
    Check if the git working directory is clean.
    
    Returns:
        True if clean, False otherwise
    """
    try:
        # Check if there are uncommitted changes
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True,
            text=True,
            check=True
        )
        
        # If output is empty, working directory is clean
        return result.stdout.strip() == ""
    except subprocess.CalledProcessError as e:
        print(f"Error checking git status: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error checking git status: {e}")
        return False


def create_branch_for_issue(issue_id: int, issue_title: str) -> Tuple[bool, str]:
    """
    Create a new git branch for working on the issue.
    
    Args:
        issue_id: Issue number
        issue_title: Issue title
        
    Returns:
        Tuple of (success boolean, branch name)
    """
    branch_name = create_branch_name(issue_id, issue_title)
    
    try:
        # Check if branch already exists
        result = subprocess.run(
            ["git", "show-ref", "--verify", f"refs/heads/{branch_name}"],
            capture_output=True,
            check=False
        )
        
        if result.returncode == 0:
            print(f"Branch '{branch_name}' already exists.")
            
            # Checkout existing branch
            print(f"Checking out existing branch '{branch_name}'...")
            subprocess.run(["git", "checkout", branch_name], check=True)
            return True, branch_name
        
        # Create and checkout new branch
        print(f"Creating and checking out new branch '{branch_name}'...")
        subprocess.run(["git", "checkout", "-b", branch_name], check=True)
        return True, branch_name
    
    except subprocess.CalledProcessError as e:
        print(f"Error creating branch: {e}")
        return False, branch_name
    except Exception as e:
        print(f"Unexpected error creating branch: {e}")
        return False, branch_name


def create_pull_request(owner: str, repo: str, issue_id: int, branch_name: str, token: str = None) -> bool:
    """
    Create a pull request for the current branch.
    
    Args:
        owner: GitHub username or organization name
        repo: Repository name
        issue_id: Issue number
        branch_name: Name of the current branch
        token: GitHub personal access token (optional)
        
    Returns:
        True if successful, False otherwise
    """
    try:
        print("\n=== Creating Pull Request ===")
        
        # Get issue details for PR title and description
        issue = get_issue_details(owner, repo, issue_id, token)
        if not issue:
            print("Could not fetch issue details for PR.")
            return False
        
        # Push the branch to remote
        print(f"Pushing branch '{branch_name}' to remote...")
        subprocess.run(["git", "push", "-u", "origin", branch_name], check=True)
        
        # Prepare PR title and body
        pr_title = f"Fix #{issue_id}: {issue['title']}"
        pr_body = f"Closes #{issue_id}\n\nThis PR addresses the issue: {issue['title']}\n\n"
        
        if issue.get('body'):
            pr_body += f"Original issue description:\n{issue['body']}\n\n"
        
        pr_body += "The changes were implemented with the assistance of Claude."
        
        # Create the PR using GitHub CLI if available
        print("Creating pull request...")
        
        # Check if gh CLI is available
        try:
            # Create PR
            subprocess.run(
                [
                    "gh", "pr", "create",
                    "--title", pr_title,
                    "--body", pr_body,
                    "--base", "main"
                ], 
                check=True
            )
            print("\nPull request created successfully!")
            return True
            
        except FileNotFoundError:
            print("GitHub CLI not found. Please install 'gh' to create PRs automatically.")
            print("You can manually create a PR at:")
            print(f"https://github.com/{owner}/{repo}/compare/main...{branch_name}")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"Error creating pull request: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error creating pull request: {e}")
        return False


def implement_fix(owner: str, repo: str, issue_id: int, token: str = None, create_pr: bool = True) -> None:
    """
    Use Claude to implement a fix for the specified issue after planning.
    Creates a branch and optionally a PR.
    
    Args:
        owner: GitHub username or organization name
        repo: Repository name
        issue_id: Issue number
        token: GitHub personal access token (optional)
        create_pr: Whether to create a PR after fixing (default: True)
    """
    issue = get_issue_details(owner, repo, issue_id, token)
    if not issue:
        print("Issue not found.")
        return
    
    print(f"\n=== Using Claude to implement the fix for Issue #{issue_id}: {issue['title']} ===")
    
    # Check if git working directory is clean
    if not check_git_status():
        print("\nWarning: Your git working directory has uncommitted changes.")
        proceed = input("Do you want to proceed anyway? (y/n): ")
        if proceed.lower() not in ('y', 'yes'):
            print("Implementation cancelled.")
            return
    
    # Create a branch for the issue
    branch_success, branch_name = create_branch_for_issue(issue_id, issue['title'])
    if not branch_success:
        print("Failed to create or checkout branch. Implementation will continue in the current branch.")
        proceed = input("Do you want to proceed? (y/n): ")
        if proceed.lower() not in ('y', 'yes'):
            print("Implementation cancelled.")
            return
    
    # Check if claude command exists
    try:
        # Confirm with the user before proceeding
        print("\nAbout to run Claude Code to implement the fix for this issue:")
        print(f"Title: {issue['title']}")
        
        # Build the prompt for Claude
        issue_prompt = f"Implement the fix for issue #{issue_id}: {issue['title']}\n\n{issue.get('body', '')}"
        
        # Call claude with the issue prompt
        print("\nLaunching Claude Code to implement the fix...\n")
        subprocess.run(["claude", "-p", issue_prompt, "--allowedTools", "Bash,WebFetch,Read,Write,Edit"], check=True)
        
        print("\nClaude Code implementation process completed.")
        
        # Commit changes
        if check_git_status():
            print("\nNo changes detected after implementation.")
        else:
            print("\nCommitting changes...")
            commit_message = f"Fix #{issue_id}: {issue['title']}"
            subprocess.run(["git", "add", "."], check=True)
            subprocess.run(["git", "commit", "-m", commit_message], check=True)
            print("Changes committed successfully.")
            
            # Create PR if requested
            if create_pr:
                create_pull_request(owner, repo, issue_id, branch_name, token)
            else:
                print("\nChanges have been committed to branch but no PR was created.")
                print("You can create a PR manually when ready.")
        
    except FileNotFoundError:
        print("Error: 'claude' command not found.")
        print("Please install Claude Code CLI to use this feature.")
    except subprocess.CalledProcessError as e:
        print(f"Error running Claude Code: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")


def fix_with_claude(owner: str, repo: str, issue_id: int, token: str = None, create_pr: bool = True) -> None:
    """
    Use Claude to fix the specified issue with a two-step process: plan and implement.
    Creates a branch and optionally a PR when complete.
    
    Args:
        owner: GitHub username or organization name
        repo: Repository name
        issue_id: Issue number
        token: GitHub personal access token (optional)
        create_pr: Whether to create a PR after fixing (default: True)
    """
    issue = get_issue_details(owner, repo, issue_id, token)
    if not issue:
        print("Issue not found.")
        return
    
    print(f"\n=== Two-step fix process for Issue #{issue_id}: {issue['title']} ===")
    
    # Step 1: Plan the fix
    plan_with_claude(owner, repo, issue_id, token)
    
    # Ask for confirmation to proceed with implementation
    confirm = input("\nProceed with implementing the fix based on the plan? (y/n): ")
    if confirm.lower() not in ('y', 'yes'):
        print("Implementation cancelled.")
        return
    
    # Step 2: Implement the fix
    implement_fix(owner, repo, issue_id, token, create_pr)

def interactive_mode(owner: str, repo: str, token: str = None) -> None:
    """
    Run an interactive prompt to query issues by ID.
    
    Args:
        owner: GitHub username or organization name
        repo: Repository name  
        token: GitHub personal access token (optional)
    """
    print("\n=== GitHub Issue Details Mode ===")
    print(f"Repository: {owner}/{repo}")
    print("Commands:")
    print("  <number>     - View issue details")
    print("  p <number>   - Plan a fix for the issue")
    print("  f <number>   - Fix issue with Claude (creates branch + PR)")
    print("  fb <number>  - Fix issue with Claude (creates branch only, no PR)")
    print("  q            - Quit")
    
    while True:
        try:
            user_input = input("\nIssue #: ")
            
            if user_input.lower() in ('q', 'quit', 'exit'):
                print("Exiting interactive mode")
                break
            
            # Check if it's a plan command
            if user_input.lower().startswith('p '):
                try:
                    issue_id = int(user_input.split(' ')[1])
                    plan_with_claude(owner, repo, issue_id, token)
                    
                    # After planning, ask if user wants to implement
                    implement_response = input("\nWould you like to implement the fix now? (y/n): ")
                    if implement_response.lower() in ('y', 'yes'):
                        create_pr = input("Create a PR after implementation? (y/n): ") 
                        create_pr_bool = create_pr.lower() in ('y', 'yes')
                        implement_fix(owner, repo, issue_id, token, create_pr_bool)
                except (ValueError, IndexError):
                    print("Please enter a valid issue number after 'p'")
                continue
            
            # Check if it's a fix with PR command
            if user_input.lower().startswith('f '):
                try:
                    issue_id = int(user_input.split(' ')[1])
                    fix_with_claude(owner, repo, issue_id, token, True)
                except (ValueError, IndexError):
                    print("Please enter a valid issue number after 'f'")
                continue
            
            # Check if it's a fix without PR command
            if user_input.lower().startswith('fb '):
                try:
                    issue_id = int(user_input.split(' ')[1])
                    fix_with_claude(owner, repo, issue_id, token, False)
                except (ValueError, IndexError):
                    print("Please enter a valid issue number after 'fb'")
                continue
                
            try:
                issue_id = int(user_input)
                issue = get_issue_details(owner, repo, issue_id, token)
                display_issue_details(issue)
            except ValueError:
                print("Invalid command. Use a number to view issue, 'p <number>' to plan, ")
                print("'f <number>' to fix with PR, 'fb <number>' to fix without PR, or 'q' to quit")
                
        except KeyboardInterrupt:
            print("\nExiting interactive mode")
            break


def main():
    parser = argparse.ArgumentParser(description="Fetch open GitHub issues for a repository")
    parser.add_argument("owner", help="GitHub username or organization name")
    parser.add_argument("repo", help="Repository name")
    parser.add_argument("-t", "--token", help="GitHub personal access token")
    parser.add_argument("-i", "--interactive", action="store_true", 
                        help="Enter interactive mode to query issues by ID")
    parser.add_argument("-f", "--fix", type=int, metavar="ISSUE_ID",
                        help="Fix the specified issue using Claude Code (creates branch and PR)")
    parser.add_argument("-fb", "--fix-branch-only", type=int, metavar="ISSUE_ID",
                        help="Fix the specified issue using Claude Code (creates branch only, no PR)")
    parser.add_argument("-p", "--plan", type=int, metavar="ISSUE_ID",
                        help="Plan a fix for the specified issue using Claude Code")
    args = parser.parse_args()
    
    if args.plan:
        plan_with_claude(args.owner, args.repo, args.plan, args.token)
        # After planning, ask if user wants to implement
        implement_response = input("\nWould you like to implement the fix now? (y/n): ")
        if implement_response.lower() in ('y', 'yes'):
            create_pr = input("Create a PR after implementation? (y/n): ")
            create_pr_bool = create_pr.lower() in ('y', 'yes')
            implement_fix(args.owner, args.repo, args.plan, args.token, create_pr_bool)
    elif args.fix:
        fix_with_claude(args.owner, args.repo, args.fix, args.token, True)
    elif args.fix_branch_only:
        fix_with_claude(args.owner, args.repo, args.fix_branch_only, args.token, False)
    elif args.interactive:
        interactive_mode(args.owner, args.repo, args.token)
    else:
        issues = get_issues(args.owner, args.repo, args.token)
        display_issues(issues)
        
        # Ask if user wants to enter interactive mode
        response = input("\nWould you like to enter interactive mode to query issues by ID? (y/n): ")
        if response.lower() in ('y', 'yes'):
            interactive_mode(args.owner, args.repo, args.token)


if __name__ == "__main__":
    main()