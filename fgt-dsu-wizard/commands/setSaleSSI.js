/**
 * Defines how to create the keyssi for a {@link Receipt} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>data</li> the specific string
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @memberOf Commands
 */
function createSaleSSI(data, domain) {
    console.log("New Sale_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createTemplateSeedSSI(domain, data.data.join(), 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "sale", createSaleSSI, "setSaleSSI", "traceability");
}

module.exports = {
    command,
    createSaleSSI
};
