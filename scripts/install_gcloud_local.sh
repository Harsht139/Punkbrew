#!/bin/bash

# Install Google Cloud CLI on Local Machine
echo "🔧 Installing Google Cloud CLI locally..."

# For Ubuntu/Debian systems
echo "Installing Google Cloud CLI via snap..."
sudo snap install google-cloud-cli

# Alternative: Install via apt (more comprehensive)
echo ""
echo "Alternative installation via apt:"
echo "Run these commands if snap installation doesn't work:"

cat << 'EOF'

# Add Google Cloud SDK repository
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Import Google Cloud public key
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Update and install
sudo apt-get update && sudo apt-get install google-cloud-cli

EOF

echo ""
echo "After installation:"
echo "1. Run: gcloud auth login"
echo "2. Run: gcloud config set project punkbrew"
echo "3. Then continue with the setup scripts"
