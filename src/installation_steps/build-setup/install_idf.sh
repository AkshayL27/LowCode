echo "Starting IDF installation:"
TARGET_DIR="$HOME/esp/esp-idf"
echo "Cloning to: $TARGET_DIR"
mkdir -p "$TARGET_DIR" 
git clone -b v5.3.1 --recursive https://github.com/espressif/esp-idf.git $TARGET_DIR
cd $TARGET_DIR
export ESP_IDF_PATH=$TARGET_DIR
./install.sh
. ./export.sh