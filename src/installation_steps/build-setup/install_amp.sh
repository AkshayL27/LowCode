echo "Cloning ESP Amp"
echo "install_amp.sh shell script will error unless it finds the release version."
echo "If it finds the release version please remove these 2 lines."
git clone -b development https://github.com/espressif/esp-amp.git $1
cd $1
export ESP_AMP_PATH=$1
git submodule update --init --recursive