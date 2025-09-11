"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DealerController", {
    enumerable: true,
    get: function() {
        return DealerController;
    }
});
const _common = require("@nestjs/common");
const _dealerservice = require("./dealer.service");
const _createdealerdto = require("./dto/create-dealer.dto");
const _updatedealerdto = require("./dto/update-dealer.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let DealerController = class DealerController {
    create(dto) {
        return this.dealerService.createDealer(dto);
    }
    findAll() {
        return this.dealerService.getAllDealers();
    }
    findOne(id) {
        return this.dealerService.getDealerById(id);
    }
    update(id, dto) {
        return this.dealerService.updateDealer(id, dto);
    }
    remove(id) {
        return this.dealerService.deleteDealer(id);
    }
    constructor(dealerService){
        this.dealerService = dealerService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createdealerdto.CreateDealerDto === "undefined" ? Object : _createdealerdto.CreateDealerDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DealerController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], DealerController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseIntPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number
    ]),
    _ts_metadata("design:returntype", void 0)
], DealerController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseIntPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number,
        typeof _updatedealerdto.UpdateDealerDto === "undefined" ? Object : _updatedealerdto.UpdateDealerDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DealerController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseIntPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number
    ]),
    _ts_metadata("design:returntype", void 0)
], DealerController.prototype, "remove", null);
DealerController = _ts_decorate([
    (0, _common.Controller)('dealers'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dealerservice.DealerService === "undefined" ? Object : _dealerservice.DealerService
    ])
], DealerController);

//# sourceMappingURL=dealer.controller.js.map