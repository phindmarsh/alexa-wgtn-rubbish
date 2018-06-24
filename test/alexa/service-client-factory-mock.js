
class DeviceAddressServiceClientMock {
    constructor(address) {
        this.address = address;
    }

    getFullAddress() {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, 1, this.address);
        });
    }
}

class ServiceClientFactoryMock {
    constructor(address) {
        this.address = address;
    }

    getDeviceAddressServiceClient() {
        return new DeviceAddressServiceClientMock(this.address);
    }
}

module.exports = {
    ServiceClientFactoryMock: ServiceClientFactoryMock
}