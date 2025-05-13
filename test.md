I want a one file python application that can get a list of open issues on github and tools to help me fix that issue. 
Place it in a directory called tools.
It should have command-line options for:
- List all open issues
- Show all details about a specific issue
- Start fixing an issue: it should ask if also should create a new branch by using command-line git (NOT gh). All info about the issue should
be placed in a markdown file in the root of the new branch and the name should contain "ISSUE" and the issue number.
It should also launch claude in one-shot mode to create a PLAN.md file containing a detailed plan for fixing. Up to date docs for claude can be found here: https://docs.anthropic.com/en/docs/claude-code/cli-usage
The claude code prompt should include "Think deeply about the best approach for implementing this".
- Enter interactive mode where all options are possible to list/use by entering commands like "l" (list), "d <issue>" (detailed info about issue)m´, "f <issue>" (fix)

Think deeply about the best approach for implementing this