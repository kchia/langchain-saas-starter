#!/bin/bash

# ComponentForge - Create GitHub Issues from Epics
# This script reads epic markdown files and creates GitHub issues with proper labels and hierarchy

set -e

# Source CCPM config
source .claude/ccpm.config

echo "🚀 ComponentForge - Creating GitHub Issues"
echo "=========================================="
echo ""
echo "Repository: $GITHUB_REPO"
echo ""

# Function to extract epic title from markdown
get_epic_title() {
    local epic_file=$1
    grep "^# Epic" "$epic_file" | head -1 | sed 's/^# //' || echo "Unknown Epic"
}

# Function to extract epic priority
get_epic_priority() {
    local epic_file=$1
    grep "^\*\*Priority\*\*:" "$epic_file" | sed 's/.*: //' | tr '[:upper:]' '[:lower:]' || echo "medium"
}

# Function to extract epic status
get_epic_status() {
    local epic_file=$1
    grep "^\*\*Status\*\*:" "$epic_file" | sed 's/.*: //' | tr -d ' ' || echo "NotStarted"
}

# Function to create epic issue
create_epic_issue() {
    local epic_file=$1
    local epic_num=$(basename "$epic_file" | cut -d- -f1)
    local epic_title=$(get_epic_title "$epic_file")
    local epic_priority=$(get_epic_priority "$epic_file")
    local epic_status=$(get_epic_status "$epic_file")

    echo "📋 Creating Epic: $epic_title"

    # Create issue with epic label
    local issue_url=$(gh issue create \
        --repo "$GITHUB_REPO" \
        --title "$epic_title" \
        --body-file "$epic_file" \
        --label "epic" \
        --label "priority:$epic_priority" \
        2>/dev/null || echo "")

    if [ -n "$issue_url" ]; then
        local issue_number=$(echo "$issue_url" | grep -oE '[0-9]+$')
        echo "  ✅ Created: $issue_url (Issue #$issue_number)"
        echo "$epic_num:$issue_number" >> .claude/.epic-issues-map
        echo "$issue_number"
    else
        echo "  ❌ Failed to create epic issue"
        echo ""
        return 1
    fi
}

# Function to extract tasks from epic
extract_tasks() {
    local epic_file=$1
    local epic_issue_number=$2

    # Extract task sections (### Task N: Title)
    local tasks=$(grep "^### Task [0-9]*:" "$epic_file" || true)

    if [ -z "$tasks" ]; then
        echo "  ℹ️  No tasks found in epic"
        return
    fi

    # Count tasks
    local task_count=$(echo "$tasks" | wc -l | tr -d ' ')
    echo "  📝 Found $task_count tasks"

    # For MVP, we'll create a single comment listing all tasks
    # In production, you might want to create sub-issues using gh-sub-issue extension

    local task_list="## Tasks\n\n"
    echo "$tasks" | while read -r task_line; do
        local task_title=$(echo "$task_line" | sed 's/^### Task [0-9]*: //')
        task_list="${task_list}- [ ] $task_title\n"
    done

    # Add task list as comment
    echo -e "$task_list" | gh issue comment "$epic_issue_number" --body-file - --repo "$GITHUB_REPO" 2>/dev/null || true
}

# Function to create all issues with dependencies
create_all_issues() {
    # Clear previous mapping
    rm -f .claude/.epic-issues-map

    # Array to store epic issue numbers
    declare -A epic_issues

    # First pass: Create all epic issues
    for epic_file in .claude/epics/*.md; do
        if [ -f "$epic_file" ]; then
            local epic_num=$(basename "$epic_file" .md | cut -d- -f1)
            local issue_number=$(create_epic_issue "$epic_file")

            if [ -n "$issue_number" ]; then
                epic_issues[$epic_num]=$issue_number

                # Extract and add tasks as comments
                extract_tasks "$epic_file" "$issue_number"
            fi

            echo ""
        fi
    done

    echo ""
    echo "✅ Epic Issues Created!"
    echo "======================="
    echo ""

    # Display summary
    if [ -f .claude/.epic-issues-map ]; then
        echo "Epic to Issue Mapping:"
        cat .claude/.epic-issues-map | while read -r line; do
            local epic=$(echo "$line" | cut -d: -f1)
            local issue=$(echo "$line" | cut -d: -f2)
            echo "  Epic $epic → Issue #$issue"
        done
        echo ""
    fi

    echo "📊 Next Steps:"
    echo "  1. View issues: gh issue list --repo $GITHUB_REPO"
    echo "  2. View epic board: gh project list --repo $GITHUB_REPO"
    echo "  3. Assign issues: gh issue edit <number> --assignee @me"
    echo ""
    echo "💡 Tip: Use 'gh issue view <number>' to see individual epic details"
}

# Main execution
main() {
    # Check if gh CLI is installed
    if ! command -v gh &> /dev/null; then
        echo "❌ Error: GitHub CLI (gh) is not installed"
        echo "Install: brew install gh (macOS) or see https://cli.github.com"
        exit 1
    fi

    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        echo "❌ Error: Not authenticated with GitHub"
        echo "Run: gh auth login"
        exit 1
    fi

    # Verify epic files exist
    if [ ! -d ".claude/epics" ] || [ -z "$(ls -A .claude/epics/*.md 2>/dev/null)" ]; then
        echo "❌ Error: No epic files found in .claude/epics/"
        exit 1
    fi

    # Confirm before creating
    echo "This will create GitHub issues for all epics in .claude/epics/"
    echo ""
    read -p "Continue? (y/N): " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi

    echo ""
    create_all_issues
}

# Run main function
main
