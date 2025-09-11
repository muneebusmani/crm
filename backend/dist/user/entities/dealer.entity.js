"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Dealer", {
    enumerable: true,
    get: function() {
        return Dealer;
    }
});
const _typeorm = require("typeorm");
const _dealertierentity = require("./dealer-tier.entity");
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
let Dealer = class Dealer {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)(),
    _ts_metadata("design:type", Number)
], Dealer.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", Number)
], Dealer.prototype, "userId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], Dealer.prototype, "tierId", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Dealer.prototype, "name", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Dealer.prototype, "owner", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Dealer.prototype, "location", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Dealer.prototype, "logo", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Dealer.prototype, "website", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Dealer.prototype, "contactEmail", void 0);
_ts_decorate([
    (0, _typeorm.OneToOne)(()=>_userentity.User, (user)=>user.dealer),
    (0, _typeorm.OneToOne)(()=>_userentity.User, (user)=>user.dealer),
    (0, _typeorm.JoinColumn)({
        name: 'userId'
    }),
    _ts_metadata("design:type", typeof _userentity.User === "undefined" ? Object : _userentity.User)
], Dealer.prototype, "user", void 0);
_ts_decorate([
    (0, _typeorm.ManyToOne)(()=>_dealertierentity.DealerTier, (dealerTier)=>dealerTier.dealers, {
        nullable: true
    }),
    (0, _typeorm.JoinColumn)({
        name: 'tierId'
    }),
    _ts_metadata("design:type", typeof _dealertierentity.DealerTier === "undefined" ? Object : _dealertierentity.DealerTier)
], Dealer.prototype, "tier", void 0);
Dealer = _ts_decorate([
    (0, _typeorm.Entity)('dealer'),
    (0, _typeorm.Unique)([
        'userId'
    ])
], Dealer);

//# sourceMappingURL=dealer.entity.js.map