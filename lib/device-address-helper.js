
class MissingDeviceAddressError extends Error {}
class DeviceAddressPermissionsNotEnabledError extends Error {}

class DeviceAddressHelper {
    constructor(serviceClientFactory, googleMapsClient) {
        this.serviceClientFactory = serviceClientFactory;
        this.googleMapsClient = googleMapsClient;
    }

    async getDeviceAddress(requestEnvelope) {
        if (requestEnvelope.context.System.user.permissions
            && requestEnvelope.context.System.user.permissions.consentToken) {
            
            const { deviceId } = requestEnvelope.context.System.device;
            const deviceAddressServiceClient = this.serviceClientFactory.getDeviceAddressServiceClient();
            const address = await deviceAddressServiceClient.getFullAddress(deviceId);
        
            if (!!address && address.addressLine1 !== null && address.city !== null) {
                const searchAddress = `${address.addressLine1}, ${address.city}`;
                const fullAddress = await this.geocodeAddress(searchAddress);
                
                return this.formatGeocodedAddress(fullAddress);
            }
            else {
                throw new MissingDeviceAddressError('Device address was not found');
            }
        }
        else {
            throw new DeviceAddressPermissionsNotEnabledError('Full device address permissions are not enabled');
        }
    }

    geocodeAddress(searchAddress) {
        return this.googleMapsClient.geocode({
            address: searchAddress,
            region: 'nz',
            components: { country: 'NZ', administrative_area: 'Wellington' }
        }).asPromise().then((response) => {
            return response.json.results.pop()
        });
    }

    formatGeocodedAddress(address) {
        const componentTypes = ['route', 'sublocality'];
        const [streetName, suburb] = address.address_components.reduce((parts, part) => {
            componentTypes.forEach((component) => {
                if (part.types.includes(component)) {
                    return parts.push(part.long_name);
                }
            });
            return parts;
        }, []);

        return { streetName: streetName, suburb: suburb };
    }
}


module.exports = {
    DeviceAddressHelper: DeviceAddressHelper,
    MissingDeviceAddressError: MissingDeviceAddressError,
    DeviceAddressPermissionsNotEnabledError: DeviceAddressPermissionsNotEnabledError
}