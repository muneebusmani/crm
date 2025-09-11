"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get Admin () {
        return _adminentity.Admin;
    },
    get AdminRole () {
        return _adminroleentity.AdminRole;
    },
    get Dealer () {
        return _dealerentity.Dealer;
    },
    get DealerTier () {
        return _dealertierentity.DealerTier;
    },
    get User () {
        return _userentity.User;
    }
});
const _adminentity = require("./admin.entity");
const _adminroleentity = require("./admin-role.entity");
const _dealerentity = require("./dealer.entity");
const _dealertierentity = require("./dealer-tier.entity");
const _userentity = require("./user.entity");

//# sourceMappingURL=index.js.map