echo "Starting IDF installation:"
git clone -b v5.3.1 --recursive https://github.com/espressif/esp-idf.git $1
cd $1
export ESP_IDF_PATH=$1
./install.sh
. ./export.sh