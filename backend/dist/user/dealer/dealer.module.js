"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DealerModule", {
    enumerable: true,
    get: function() {
        return DealerModule;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _entities = require("../entities");
const _dealercontroller = require("./dealer.controller");
const _dealerservice = require("./dealer.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let DealerModule = class DealerModule {
};
DealerModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _typeorm.TypeOrmModule.forFeature([
                _entities.User,
                _entities.Dealer,
                _entities.DealerTier
            ])
        ],
        controllers: [
            _dealercontroller.DealerController
        ],
        providers: [
            _dealerservice.DealerService
        ],
        exports: [
            _dealerservice.DealerService
        ]
    })
], DealerModule);

//# sourceMappingURL=dealer.module.js.map