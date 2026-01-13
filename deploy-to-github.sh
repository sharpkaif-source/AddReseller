#!/bin/bash
# Bash script to deploy to GitHub
# Usage: ./deploy-to-github.sh your-username

if [ -z "$1" ]; then
    echo "❌ Error: GitHub username required"
    echo "Usage: ./deploy-to-github.sh your-username [repo-name]"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME=${2:-"AddReseller"}

echo "🚀 Starting GitHub deployment..."
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Remote 'origin' already exists: $(git remote get-url origin)"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
    else
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Add remote
REMOTE_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo "📦 Adding remote: $REMOTE_URL"
git remote add origin $REMOTE_URL

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 Current branch: $CURRENT_BRANCH"

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
echo "   Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

if git push -u origin $CURRENT_BRANCH; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Go to: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "   2. Click 'Actions' tab"
    echo "   3. Click 'Create Reseller Bot' workflow"
    echo "   4. Click 'Run workflow' → 'Run workflow'"
    echo ""
    echo "🔗 Direct link: https://github.com/$GITHUB_USERNAME/$REPO_NAME/actions"
else
    echo ""
    echo "❌ Error pushing to GitHub"
    echo "   Make sure you've created the repository on GitHub first:"
    echo "   https://github.com/new"
    echo ""
    echo "   Repository name should be: $REPO_NAME"
    exit 1
fi
