if [[ "$VERCEL_ENV" == "preview" ]]; then
    echo "✅ - Preview build can proceed"
    exit 0; # Allow the build to proceed
elif [[ "$VERCEL_ENV" == "production" ]]; then
    if [[ "$VERCEL_GIT_COMMIT_MESSAGE" =~ build\(release\ [vV][0-9]+\.[0-9]+\.[0-9]+\): ]]; then
        echo "✅ - Production build can proceed"
        exit 0; # Allow the build to proceed
    else
        echo "🛑 - Production build cancelled"
        exit 1; # Cancel the build
    fi
else
    echo "⚠️ - Unknown environment, build cancelled"
    exit 1; # Cancel the build for unknown environments
fi