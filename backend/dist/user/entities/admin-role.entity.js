"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AdminRole", {
    enumerable: true,
    get: function() {
        return AdminRole;
    }
});
const _typeorm = require("typeorm");
const _adminentity = require("./admin.entity");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AdminRole = class AdminRole {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)(),
    _ts_metadata("design:type", Number)
], AdminRole.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        unique: true
    }),
    _ts_metadata("design:type", String)
], AdminRole.prototype, "name", void 0);
_ts_decorate([
    (0, _typeorm.OneToMany)(()=>_adminentity.Admin, (admin)=>admin.adminRole),
    _ts_metadata("design:type", Array)
], AdminRole.prototype, "admins", void 0);
AdminRole = _ts_decorate([
    (0, _typeorm.Entity)('admin_role')
], AdminRole);

//# sourceMappingURL=admin-role.entity.js.map