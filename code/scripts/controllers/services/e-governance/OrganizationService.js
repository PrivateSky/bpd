export default class GovernanceService {

    ORGANIZATION_PATH = "/organizations";

    constructor(DSUStorage) {
        this.DSUStorage = DSUStorage;
    }

    listOrganizations(callback) {
        this.DSUStorage.call('listDSUs', this.ORGANIZATION_PATH, (err, organizationsIdentifierList) => {
            if (err) {
                return callback(err);
            }

            const organizationsDataList = [];
            const getOrganizationDSU = (organizationsIdentifierList) => {
                if (!organizationsIdentifierList.length) {
                    return callback(undefined, organizationsDataList);
                }

                const id = organizationsIdentifierList.pop();
                this.getOrganizationData(id.identifier, (err, organizationData) => {
                    if (err) {
                        return callback(err);
                    }

                    organizationsDataList.push(organizationData);
                    getOrganizationDSU(organizationsIdentifierList);
                });
            };

            getOrganizationDSU(organizationsIdentifierList);
        });
    }

    getOrganizationData(identifier, callback) {
        this.DSUStorage.getItem(this.getOrganizationsDataPath(identifier), (err, content) => {
            if (err) {
                return callback(err);
            }

            const textDecoder = new TextDecoder("utf-8");
            const organizationData = JSON.parse(textDecoder.decode(content));
            callback(undefined, organizationData);
        });
    }

    createOrganization(organizationName, callback) {
        this.DSUStorage.call('createSSIAndMount', this.ORGANIZATION_PATH, (err, keySSI) => {
            if (err) {
                callback(err, undefined);
                return;
            }

            const organizationData = {
                name: organizationName,
                keySSI: keySSI,
                uid: keySSI,
                numberOfClusters: 0,
                isOwner: true,
                type: "Owner"
            };
            this.updateOrganizationData(organizationData, callback);
        });
    }

    updateOrganizationData(organizationData, callback) {
        this.DSUStorage.setObject(this.getOrganizationsDataPath(organizationData.uid), organizationData, (err) => {
            callback(err, organizationData);
        });
    }

    getOrganizationsDataPath(identifier) {
        return `${this.ORGANIZATION_PATH}/${identifier}/data.json`;
    }
}