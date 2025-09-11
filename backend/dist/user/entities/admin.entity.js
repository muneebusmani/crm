"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Admin", {
    enumerable: true,
    get: function() {
        return Admin;
    }
});
const _typeorm = require("typeorm");
const _adminroleentity = require("./admin-role.entity");
const _userentity = require("./user.entity");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let Admin = class Admin {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)(),
    _ts_metadata("design:type", Number)
], Admin.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", Number)
], Admin.prototype, "userId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], Admin.prototype, "roleId", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Admin.prototype, "role", void 0);
_ts_decorate([
    (0, _typeorm.OneToOne)(()=>_userentity.User, (user)=>user.admin),
    (0, _typeorm.OneToOne)(()=>_userentity.User, (user)=>user.admin),
    (0, _typeorm.JoinColumn)({
        name: 'userId'
    }),
    _ts_metadata("design:type", typeof _userentity.User === "undefined" ? Object : _userentity.User)
], Admin.prototype, "user", void 0);
_ts_decorate([
    (0, _typeorm.ManyToOne)(()=>_adminroleentity.AdminRole, (adminRole)=>adminRole.admins, {
        nullable: true
    }),
    (0, _typeorm.JoinColumn)({
        name: 'roleId'
    }),
    _ts_metadata("design:type", typeof _adminroleentity.AdminRole === "undefined" ? Object : _adminroleentity.AdminRole)
], Admin.prototype, "adminRole", void 0);
Admin = _ts_decorate([
    (0, _typeorm.Entity)('admin'),
    (0, _typeorm.Unique)([
        'userId'
    ])
], Admin);

//# sourceMappingURL=admin.entity.js.map