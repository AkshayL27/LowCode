echo "Starting Matter installation:"
git clone --single-branch -b release/v1.3 --depth 1 https://github.com/espressif/esp-matter.git $1
cd $1
export ESP_MATTER_PATH=$1
git submodule update --init --depth 1
cd connectedhomeip/connectedhomeip
./scripts/checkout_submodules.py --platform esp32 linux --shallow
cd ..
./install.sh
. ./export.sh