echo "Starting Matter installation:"
TARGET_DIR="$HOME/esp/esp-matter"
echo "Cloning to: $TARGET_DIR"
mkdir -p "$TARGET_DIR" 
git clone --single-branch -b release/v1.3 --depth 1 https://github.com/espressif/esp-matter.git $TARGET_DIR
cd $TARGET_DIR
export ESP_MATTER_PATH=$TARGET_DIR
git submodule update --init --depth 1
cd connectedhomeip/connectedhomeip
./scripts/checkout_submodules.py --platform esp32 linux --shallow
cd $TARGET_DIR
./install.sh
. ./export.sh