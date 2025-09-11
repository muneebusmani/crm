"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DealerTier", {
    enumerable: true,
    get: function() {
        return DealerTier;
    }
});
const _typeorm = require("typeorm");
const _dealerentity = require("./dealer.entity");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let DealerTier = class DealerTier {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)(),
    _ts_metadata("design:type", Number)
], DealerTier.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        unique: true
    }),
    _ts_metadata("design:type", String)
], DealerTier.prototype, "name", void 0);
_ts_decorate([
    (0, _typeorm.OneToMany)(()=>_dealerentity.Dealer, (dealer)=>dealer.tier),
    _ts_metadata("design:type", Array)
], DealerTier.prototype, "dealers", void 0);
DealerTier = _ts_decorate([
    (0, _typeorm.Entity)('dealer_tier')
], DealerTier);

//# sourceMappingURL=dealer-tier.entity.js.map