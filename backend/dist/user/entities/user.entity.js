/** biome-ignore-all lint/suspicious/noExplicitAny: <idk> */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "User", {
    enumerable: true,
    get: function() {
        return User;
    }
});
const _typeorm = require("typeorm");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let User = class User {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)(),
    _ts_metadata("design:type", Number)
], User.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        unique: true
    }),
    _ts_metadata("design:type", String)
], User.prototype, "email", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], User.prototype, "password", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], User.prototype, "name", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        unique: true
    }),
    _ts_metadata("design:type", String)
], User.prototype, "username", void 0);
_ts_decorate([
    (0, _typeorm.OneToOne)('Admin', 'user'),
    _ts_metadata("design:type", Object)
], User.prototype, "admin", void 0);
_ts_decorate([
    (0, _typeorm.OneToOne)('Dealer', 'user'),
    _ts_metadata("design:type", Object)
], User.prototype, "dealer", void 0);
User = _ts_decorate([
    (0, _typeorm.Entity)('user')
], User);

//# sourceMappingURL=user.entity.js.map