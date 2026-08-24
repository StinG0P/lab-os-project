#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Target directories
OUTPUT_DIR="bin"
mkdir -p "$OUTPUT_DIR"

# Operating Systems and Architectures to target
OS_TARGETS=("linux" "windows" "darwin")
ARCH_TARGETS=("amd64" "arm64")

echo "Starting cross-compilation build suite for Lab OS Agent..."

# Loop through all combinations of OS and Architecture
for os in "${OS_TARGETS[@]}"; do
  for arch in "${ARCH_TARGETS[@]}"; do
    
    # Define binary name and extension
    EXT=""
    if [ "$os" = "windows" ]; then
      EXT=".exe"
    fi
    
    OUTPUT_NAME="agent-${os}-${arch}${EXT}"
    OUTPUT_PATH="${OUTPUT_DIR}/${OUTPUT_NAME}"
    
    echo " -> Compiling for ${os}/${arch}..."
    
    # Run the Go build with env overrides
    GOOS="$os" GOARCH="$arch" go build -o "$OUTPUT_PATH" main.go
    
    # Apply execution permissions for non-windows builds
    if [ "$os" != "windows" ]; then
      chmod +x "$OUTPUT_PATH"
    fi
    
  done
done

echo "Build process completed. Compiled binaries are located in the '${OUTPUT_DIR}/' directory:"
ls -lh "$OUTPUT_DIR"
