COMMAND="sudo apt install -y git wget flex bison gperf python3 python3-pip python3-venv cmake ninja-build ccache libffi-dev libssl-dev dfu-util libusb-1.0-0"
echo "Install Pre-requisite dependencies for ESP IDF"
if ! eval "$COMMAND"; then
    echo "The install command failed. Running 'sudo apt update'..."
    sudo apt update
    
    if ! eval "$COMMAND"; then
        echo "Failed to install the packages after updating."
        exit 1
    fi
fi

