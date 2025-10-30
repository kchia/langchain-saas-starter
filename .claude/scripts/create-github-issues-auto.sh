#!/bin/bash

# ComponentForge - Create GitHub Issues from Epics (Auto-confirm)
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
    local priority=$(grep "^\*\*Priority\*\*:" "$epic_file" | sed 's/.*: //' | tr '[:upper:]' '[:lower:]' | tr -d ' ' || echo "medium")
    # Map to valid label names
    case $priority in
        critical) echo "critical" ;;
        high) echo "high" ;;
        low) echo "low" ;;
        *) echo "medium" ;;
    esac
}

# Function to create epic issue
create_epic_issue() {
    local epic_file=$1
    local epic_num=$(basename "$epic_file" .md | cut -d- -f1)
    local epic_title=$(get_epic_title "$epic_file")
    local epic_priority=$(get_epic_priority "$epic_file")

    echo "📋 Creating Epic: $epic_title"
    echo "   Priority: $epic_priority"

    # Create issue with epic label
    local issue_url=$(gh issue create \
        --repo "$GITHUB_REPO" \
        --title "$epic_title" \
        --body-file "$epic_file" \
        --label "epic" \
        --label "priority:$epic_priority" \
        2>&1)

    if echo "$issue_url" | grep -q "https://"; then
        local issue_number=$(echo "$issue_url" | grep -oE '[0-9]+$')
        echo "  ✅ Created: $issue_url (Issue #$issue_number)"
        echo "$epic_num:$issue_number" >> .claude/.epic-issues-map
        echo "$issue_number"
    else
        echo "  ❌ Failed to create epic issue: $issue_url"
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
    echo "  📝 Found $task_count tasks - adding as checklist"

    # Create task checklist
    local task_list="## Tasks Checklist\n\n"
    echo "$tasks" | while IFS= read -r task_line; do
        local task_title=$(echo "$task_line" | sed 's/^### Task [0-9]*: //')
        task_list="${task_list}- [ ] $task_title\n"
    done

    # Add task list as comment
    echo -e "$task_list" | gh issue comment "$epic_issue_number" --body-file - --repo "$GITHUB_REPO" 2>/dev/null && \
        echo "  ✅ Added task checklist to issue #$epic_issue_number" || \
        echo "  ⚠️  Could not add task checklist"
}

# Main execution
echo "Creating issues for all epics..."
echo ""

# Clear previous mapping
rm -f .claude/.epic-issues-map

# Create epic issues
for epic_file in .claude/epics/*.md; do
    if [ -f "$epic_file" ]; then
        issue_number=$(create_epic_issue "$epic_file")

        if [ -n "$issue_number" ] && [ "$issue_number" != "1" ]; then
            # Extract and add tasks as checklist
            extract_tasks "$epic_file" "$issue_number"
        fi

        echo ""
        sleep 1  # Rate limiting
    fi
done

echo ""
echo "✅ Epic Issues Created!"
echo "======================="
echo ""

# Display summary
if [ -f .claude/.epic-issues-map ]; then
    echo "Epic to Issue Mapping:"
    cat .claude/.epic-issues-map | while IFS=: read -r epic issue; do
        echo "  Epic $epic → Issue #$issue"
    done
    echo ""
fi

echo "📊 View Your Issues:"
echo "  Browser: https://github.com/$GITHUB_REPO/issues"
echo "  CLI: gh issue list --repo $GITHUB_REPO --label epic"
echo ""
echo "💡 Next Steps:"
echo "  1. Review issues and add milestones: gh issue edit <number> --milestone <name>"
echo "  2. Assign yourself: gh issue edit <number> --assignee @me"
echo "  3. Start working: Pick an issue and begin implementation!"
